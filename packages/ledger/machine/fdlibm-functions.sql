-- V8's Math functions in PL/pgSQL, bit for bit: the fdlibm port V8 14.6.202.34 compiles (src/base/ieee754.cc, as
-- Node v26.13.1 runs it) for sin, cos, tan, asin, acos, atan, atan2, sinh, cosh, tanh, exp, log and log10, and for
-- `**` and Math.pow the math::pow of src/numbers/ieee754.cc, which under --use-std-math-pow, the default, is glibc's.
-- fdlibm's macros are written out in place.
--
-- That Node is built by clang with its default -ffp-contract=on, so every a * b + c, a * b - c and c - a * b that the
-- C writes in one expression is one fused multiply-add on AArch64 (fmadd, fmsub, fnmsub); glibc 2.43's pow is built
-- by GCC, whose contraction spans statements. Each such operation is an fma here (inline, as the @fma statements of
-- the template, or fdlibm_fma), read off clang's IR (V8) and libm.so.6's code (glibc); every other operation is the
-- single IEEE operation the C performs. Results are equal to Node's through float8send for every input; a NaN
-- result is a NaN, whose bits V8 itself does not keep (they change with how a value is stored).
--
-- No function reads a table or a setting. PostgreSQL raises where IEEE overflows or underflows to zero, so each
-- operation that could is guarded or computed exactly. Bit access, powers of two and the fma are inline: grizzle
-- installs each function SECURITY DEFINER with its search_path, which makes every call cost and no call inline: each
-- Math function is one call, the kernels, exp, expm1, log and atan written once as macros and inline where used. The
-- Math functions are STRICT: NULL in is NULL out.
--
-- A source, edited here: its upstream is fdlibm as V8's src/base/ieee754.cc ports it in Node 26.13.1, and glibc 2.43's
-- pow with its log and exp tables, read off the libm.so.6 of the machine that wrote it, an LGPL binary that no
-- generator in the repository can read.

-- The bits of a double, as the signed 64-bit integer that holds them.
create function p3.fdlibm_bits(x float8) returns bigint language sql immutable as $$
  select int8(float8send(x))
$$;
-- GET_HIGH_WORD: the sign, exponent and top 20 significand bits, as an int32_t.
create function p3.fdlibm_hi(x float8) returns int language sql immutable as $$
  select (int8(float8send(x)) >> 32)::int
$$;
-- GET_LOW_WORD: the low 32 significand bits, as a uint32_t.
create function p3.fdlibm_lo(x float8) returns bigint language sql immutable as $$
  select (int8(float8send(x)) & 4294967295)
$$;
-- 2^k for an integer k in [-1074, 1023]: a product of two powers of two, exact since the result is a double.
create function p3.fdlibm_pow2(k int) returns float8 language sql immutable as $$
  select (case when (k) >= -1022 then (('{2.2250738585072014e-308,4.1045368012983762e-289,7.571533991467358e-270,1.3967014978599092e-250,2.5764595078388533e-231,4.7527289157379e-212,8.767237396033612e-193,1.617269844780878e-173,2.983336292480083e-154,5.503284107318959e-135,1.0151767349262597e-115,1.8726705418768793e-96,3.454467422037778e-77,6.372367644529809e-58,1.1754943508222875e-38,2.168404344971009e-19,4,73786976294838210000,1.361129467683754e+39,2.5108406941546723e+58,4.631683569492648e+77,8.54394814368364e+96,1.5760802478557792e+116,2.9073548971824276e+135,5.363123171977039e+154,9.893216058924181e+173,1.824976247048878e+193,3.366486976990959e+212,6.210072369202836e+231,1.1455561567389984e+251,2.113178124542661e+270,3.89812560456e+289}'::float8[])[(((k) + 1022) >> 6) + 1] * ('{1,2,4,8,16,32,64,128,256,512,1024,2048,4096,8192,16384,32768,65536,131072,262144,524288,1048576,2097152,4194304,8388608,16777216,33554432,67108864,134217728,268435456,536870912,1073741824,2147483648,4294967296,8589934592,17179869184,34359738368,68719476736,137438953472,274877906944,549755813888,1099511627776,2199023255552,4398046511104,8796093022208,17592186044416,35184372088832,70368744177664,140737488355328,281474976710656,562949953421312,1125899906842624,2251799813685248,4503599627370496,9007199254740992,18014398509481984,36028797018963970,72057594037927940,144115188075855870,288230376151711740,576460752303423500,1152921504606847000,2305843009213694000,4611686018427388000,9223372036854776000}'::float8[])[(((k) + 1022) & 63) + 1]) else 2.2250738585072014e-308 * ('{0.5,0.25,0.125,0.0625,0.03125,0.015625,0.0078125,0.00390625,0.001953125,0.0009765625,0.00048828125,0.000244140625,0.0001220703125,0.00006103515625,0.000030517578125,0.0000152587890625,0.00000762939453125,0.000003814697265625,0.0000019073486328125,9.5367431640625e-7,4.76837158203125e-7,2.384185791015625e-7,1.1920928955078125e-7,5.960464477539063e-8,2.9802322387695312e-8,1.4901161193847656e-8,7.450580596923828e-9,3.725290298461914e-9,1.862645149230957e-9,9.313225746154785e-10,4.656612873077393e-10,2.3283064365386963e-10,1.1641532182693481e-10,5.820766091346741e-11,2.9103830456733704e-11,1.4551915228366852e-11,7.275957614183426e-12,3.637978807091713e-12,1.8189894035458565e-12,9.094947017729282e-13,4.547473508864641e-13,2.2737367544323206e-13,1.1368683772161603e-13,5.684341886080802e-14,2.842170943040401e-14,1.4210854715202004e-14,7.105427357601002e-15,3.552713678800501e-15,1.7763568394002505e-15,8.881784197001252e-16,4.440892098500626e-16,2.220446049250313e-16}'::float8[])[-1022 - (k)] end)
$$;
-- The double whose bits are b (PostgreSQL has float8send but no SQL-callable inverse): its significand times a power
-- of two, exact; NaN for every NaN pattern.
create function p3.fdlibm_from_bits(b bigint) returns float8 language plpgsql immutable as $$
declare m bigint := b & 9223372036854775807; r float8;
begin
  if m < 4503599627370496 then r := m::float8 * 4.9406564584124654e-324;
  elsif m < 9218868437227405312 then r := ((m & 4503599627370495) | 4503599627370496)::float8 * (case when ((m >> 52)::int - 1075) >= -1022 then (('{2.2250738585072014e-308,4.1045368012983762e-289,7.571533991467358e-270,1.3967014978599092e-250,2.5764595078388533e-231,4.7527289157379e-212,8.767237396033612e-193,1.617269844780878e-173,2.983336292480083e-154,5.503284107318959e-135,1.0151767349262597e-115,1.8726705418768793e-96,3.454467422037778e-77,6.372367644529809e-58,1.1754943508222875e-38,2.168404344971009e-19,4,73786976294838210000,1.361129467683754e+39,2.5108406941546723e+58,4.631683569492648e+77,8.54394814368364e+96,1.5760802478557792e+116,2.9073548971824276e+135,5.363123171977039e+154,9.893216058924181e+173,1.824976247048878e+193,3.366486976990959e+212,6.210072369202836e+231,1.1455561567389984e+251,2.113178124542661e+270,3.89812560456e+289}'::float8[])[((((m >> 52)::int - 1075) + 1022) >> 6) + 1] * ('{1,2,4,8,16,32,64,128,256,512,1024,2048,4096,8192,16384,32768,65536,131072,262144,524288,1048576,2097152,4194304,8388608,16777216,33554432,67108864,134217728,268435456,536870912,1073741824,2147483648,4294967296,8589934592,17179869184,34359738368,68719476736,137438953472,274877906944,549755813888,1099511627776,2199023255552,4398046511104,8796093022208,17592186044416,35184372088832,70368744177664,140737488355328,281474976710656,562949953421312,1125899906842624,2251799813685248,4503599627370496,9007199254740992,18014398509481984,36028797018963970,72057594037927940,144115188075855870,288230376151711740,576460752303423500,1152921504606847000,2305843009213694000,4611686018427388000,9223372036854776000}'::float8[])[((((m >> 52)::int - 1075) + 1022) & 63) + 1]) else 2.2250738585072014e-308 * ('{0.5,0.25,0.125,0.0625,0.03125,0.015625,0.0078125,0.00390625,0.001953125,0.0009765625,0.00048828125,0.000244140625,0.0001220703125,0.00006103515625,0.000030517578125,0.0000152587890625,0.00000762939453125,0.000003814697265625,0.0000019073486328125,9.5367431640625e-7,4.76837158203125e-7,2.384185791015625e-7,1.1920928955078125e-7,5.960464477539063e-8,2.9802322387695312e-8,1.4901161193847656e-8,7.450580596923828e-9,3.725290298461914e-9,1.862645149230957e-9,9.313225746154785e-10,4.656612873077393e-10,2.3283064365386963e-10,1.1641532182693481e-10,5.820766091346741e-11,2.9103830456733704e-11,1.4551915228366852e-11,7.275957614183426e-12,3.637978807091713e-12,1.8189894035458565e-12,9.094947017729282e-13,4.547473508864641e-13,2.2737367544323206e-13,1.1368683772161603e-13,5.684341886080802e-14,2.842170943040401e-14,1.4210854715202004e-14,7.105427357601002e-15,3.552713678800501e-15,1.7763568394002505e-15,8.881784197001252e-16,4.440892098500626e-16,2.220446049250313e-16}'::float8[])[-1022 - ((m >> 52)::int - 1075)] end);
  elsif m = 9218868437227405312 then r := 'Infinity';
  else r := 'NaN';
  end if;
  return case when b < 0 then -r else r end;
end $$;

-- b^e for integers b > 0 and e >= 0, exactly.
create function p3.fdlibm_ipow(b int, e int) returns numeric language plpgsql immutable as $$
declare r numeric := 1; f numeric := b; n int := e;
begin
  while n > 0 loop
    if (n & 1) = 1 then r := r * f; end if;
    n := n >> 1;
    if n > 0 then f := f * f; end if;
  end loop;
  return r;
end $$;
-- n · 2^k rounded to the nearest double, ties to even, through float8 input's strtod (correctly rounded): the exact
-- decimal n · 5^-k · 10^k for k < 0. strtod's range error is an infinity, or a zero of n's sign.
create function p3.fdlibm_round_scaled(k int, n numeric) returns float8 language plpgsql immutable as $$
begin
  if k >= 0 then return (n * fdlibm_ipow(b => 2, e => k))::text::float8; end if;
  return ((n * fdlibm_ipow(b => 5, e => -k))::text || 'e' || k)::float8;
exception when numeric_value_out_of_range then
  if k >= 0 or abs(n) >= fdlibm_ipow(b => 2, e => -k) then
    return case when n < 0 then '-Infinity'::float8 else 'Infinity'::float8 end;
  end if;
  return case when n < 0 then '-0'::float8 else 0::float8 end;
end $$;
-- fma for what its fast path excludes: NaN, infinities, zero products, and operands whose product could leave
-- Dekker's exact range; finite ones as integers times a common power of two, exactly, rounded once.
create function p3.fdlibm_fma_wide(a float8, b float8, c float8) returns float8 language plpgsql immutable as $$
declare ba bigint; bb bigint; bc bigint; ma numeric; mb numeric; mc numeric; ka int; kb int; kc int; k int; n numeric;
begin
  if a = 'NaN' or b = 'NaN' or c = 'NaN' then return 'NaN'; end if;
  if abs(a) = 'Infinity' or abs(b) = 'Infinity' then
    if a = 0 or b = 0 then return 'NaN'; end if;
    if abs(c) = 'Infinity' and (c < 0) <> ((a < 0) <> (b < 0)) then return 'NaN'; end if;
    return case when (a < 0) <> (b < 0) then '-Infinity'::float8 else 'Infinity'::float8 end;
  end if;
  if abs(c) = 'Infinity' then return c; end if;
  if a = 0 or b = 0 then return a * b + c; end if;
  ba := fdlibm_bits(x => abs(a)); ka := (ba >> 52)::int;
  ma := case when ka = 0 then ba else (ba & 4503599627370495) | 4503599627370496 end;
  ka := case when ka = 0 then -1074 else ka - 1075 end;
  bb := fdlibm_bits(x => abs(b)); kb := (bb >> 52)::int;
  mb := case when kb = 0 then bb else (bb & 4503599627370495) | 4503599627370496 end;
  kb := case when kb = 0 then -1074 else kb - 1075 end;
  if (a < 0) <> (b < 0) then ma := -ma; end if;
  if c = 0 then
    n := ma * mb; k := ka + kb;
  else
    bc := fdlibm_bits(x => abs(c)); kc := (bc >> 52)::int;
    mc := case when kc = 0 then bc else (bc & 4503599627370495) | 4503599627370496 end;
    kc := case when kc = 0 then -1074 else kc - 1075 end;
    if c < 0 then mc := -mc; end if;
    k := case when ka + kb < kc then ka + kb else kc end;
    n := ma * mb * fdlibm_ipow(b => 2, e => ka + kb - k) + mc * fdlibm_ipow(b => 2, e => kc - k);
  end if;
  if n = 0 then return 0; end if;
  return fdlibm_round_scaled(n => n, k => k);
end $$;
-- fma(a, b, c): a × b + c rounded once, as AArch64's fmadd. With a and b in [1e-144, 1e144] in magnitude and c at
-- most 1e288, Dekker's exact product p + e, TwoSum of c + p, and Boldo and Melquiond's emulation: s + v, the error w
-- of v deciding a tie of s + v toward its side; a zero product is IEEE's a × b + c, the rest fdlibm_fma_wide. The
-- functions below hold it inline.
create function p3.fdlibm_fma(a float8, b float8, c float8) returns float8 language plpgsql immutable as $$
declare f_a float8; f_b float8; f_c float8; f_p float8; f_ah float8; f_bh float8; f_e float8; f_s float8; f_tl float8; f_w float8; r float8;
begin
  if abs(a) >= 1e-144 and abs(a) <= 1e144 and abs(b) >= 1e-144 and abs(b) <= 1e144 and abs(c) <= 1e288 then
    f_p := a * b;
    f_ah := (a * 134217729 - (a * 134217729 - a));
    f_bh := (b * 134217729 - (b * 134217729 - b));
    f_e := (a - f_ah) * (b - f_bh) - (((f_p - f_ah * f_bh) - (a - f_ah) * f_bh) - f_ah * (b - f_bh));
    f_s := c + f_p;
    f_tl := (c - (f_s - (f_s - c))) + (f_p - (f_s - c));
    f_w := (f_tl - ((f_tl + f_e) - ((f_tl + f_e) - f_tl))) + (f_e - ((f_tl + f_e) - f_tl));
    r := f_s + (f_tl + f_e);
    if f_w <> 0 and ((f_s - (r - (r - f_s))) + ((f_tl + f_e) - (r - f_s))) <> 0 and (r + 2 * ((f_s - (r - (r - f_s))) + ((f_tl + f_e) - (r - f_s)))) - r = 2 * ((f_s - (r - (r - f_s))) + ((f_tl + f_e) - (r - f_s))) and (f_w < 0) = (((f_s - (r - (r - f_s))) + ((f_tl + f_e) - (r - f_s))) < 0) then r := r + 2 * ((f_s - (r - (r - f_s))) + ((f_tl + f_e) - (r - f_s))); end if;
  elsif a = 0 or b = 0 then
    r := a * b + c;
  else
    r := fdlibm_fma_wide(a => a, b => b, c => c);
  end if;
  return r;
end $$;

-- V8's __kernel_sin: sin(x + y) on [-π/4, π/4], y the tail of x, iy = 0 when y is 0. 0.5 × y is exact (a tail of
-- rem_pio2 is 0 or far above the subnormals), so its fused and unfused forms agree.
create function p3.fdlibm_kernel_sin(iy int, x float8, y float8) returns float8 language plpgsql immutable as $$
declare f_a float8; f_b float8; f_c float8; f_p float8; f_ah float8; f_bh float8; f_e float8; f_s float8; f_tl float8; f_w float8; k_ix int; k_hx int; k_x float8; k_y float8; k_z float8; k_v float8; k_r float8; k_u float8; k_q float8; k_w float8; k_a float8; k_t float8; k_s float8;
 res float8;
begin
  k_ix := (int8(float8send(x)) >> 32)::int & 2147483647;
  if k_ix < 0x3E400000 then
    res := x;
  else
    k_z := x * x;
    k_v := k_z * x;
    if abs(k_z) >= 1e-144 and abs(k_z) <= 1e144 and abs((1.58969099521155010221e-10)::float8) >= 1e-144 and abs((1.58969099521155010221e-10)::float8) <= 1e144 and abs((-2.50507602534068634195e-08)::float8) <= 1e288 then
      f_p := k_z * (1.58969099521155010221e-10)::float8;
      f_ah := (k_z * 134217729 - (k_z * 134217729 - k_z));
      f_e := (k_z - f_ah) * ((1.58969099521155010221e-10)::float8 - ((1.58969099521155010221e-10)::float8 * 134217729 - ((1.58969099521155010221e-10)::float8 * 134217729 - (1.58969099521155010221e-10)::float8))) - (((f_p - f_ah * ((1.58969099521155010221e-10)::float8 * 134217729 - ((1.58969099521155010221e-10)::float8 * 134217729 - (1.58969099521155010221e-10)::float8))) - (k_z - f_ah) * ((1.58969099521155010221e-10)::float8 * 134217729 - ((1.58969099521155010221e-10)::float8 * 134217729 - (1.58969099521155010221e-10)::float8))) - f_ah * ((1.58969099521155010221e-10)::float8 - ((1.58969099521155010221e-10)::float8 * 134217729 - ((1.58969099521155010221e-10)::float8 * 134217729 - (1.58969099521155010221e-10)::float8))));
      f_s := (-2.50507602534068634195e-08)::float8 + f_p;
      f_tl := ((-2.50507602534068634195e-08)::float8 - (f_s - (f_s - (-2.50507602534068634195e-08)::float8))) + (f_p - (f_s - (-2.50507602534068634195e-08)::float8));
      f_w := (f_tl - ((f_tl + f_e) - ((f_tl + f_e) - f_tl))) + (f_e - ((f_tl + f_e) - f_tl));
      k_r := f_s + (f_tl + f_e);
      if f_w <> 0 and ((f_s - (k_r - (k_r - f_s))) + ((f_tl + f_e) - (k_r - f_s))) <> 0 and (k_r + 2 * ((f_s - (k_r - (k_r - f_s))) + ((f_tl + f_e) - (k_r - f_s)))) - k_r = 2 * ((f_s - (k_r - (k_r - f_s))) + ((f_tl + f_e) - (k_r - f_s))) and (f_w < 0) = (((f_s - (k_r - (k_r - f_s))) + ((f_tl + f_e) - (k_r - f_s))) < 0) then k_r := k_r + 2 * ((f_s - (k_r - (k_r - f_s))) + ((f_tl + f_e) - (k_r - f_s))); end if;
    elsif k_z = 0 or (1.58969099521155010221e-10)::float8 = 0 then
      k_r := k_z * (1.58969099521155010221e-10)::float8 + (-2.50507602534068634195e-08)::float8;
    else
      k_r := fdlibm_fma_wide(a => k_z, b => (1.58969099521155010221e-10)::float8, c => (-2.50507602534068634195e-08)::float8);
    end if;
    if abs(k_z) >= 1e-144 and abs(k_z) <= 1e144 and abs(k_r) >= 1e-144 and abs(k_r) <= 1e144 and abs((2.75573137070700676789e-06)::float8) <= 1e288 then
      f_p := k_z * k_r;
      f_ah := (k_z * 134217729 - (k_z * 134217729 - k_z));
      f_bh := (k_r * 134217729 - (k_r * 134217729 - k_r));
      f_e := (k_z - f_ah) * (k_r - f_bh) - (((f_p - f_ah * f_bh) - (k_z - f_ah) * f_bh) - f_ah * (k_r - f_bh));
      f_s := (2.75573137070700676789e-06)::float8 + f_p;
      f_tl := ((2.75573137070700676789e-06)::float8 - (f_s - (f_s - (2.75573137070700676789e-06)::float8))) + (f_p - (f_s - (2.75573137070700676789e-06)::float8));
      f_w := (f_tl - ((f_tl + f_e) - ((f_tl + f_e) - f_tl))) + (f_e - ((f_tl + f_e) - f_tl));
      k_r := f_s + (f_tl + f_e);
      if f_w <> 0 and ((f_s - (k_r - (k_r - f_s))) + ((f_tl + f_e) - (k_r - f_s))) <> 0 and (k_r + 2 * ((f_s - (k_r - (k_r - f_s))) + ((f_tl + f_e) - (k_r - f_s)))) - k_r = 2 * ((f_s - (k_r - (k_r - f_s))) + ((f_tl + f_e) - (k_r - f_s))) and (f_w < 0) = (((f_s - (k_r - (k_r - f_s))) + ((f_tl + f_e) - (k_r - f_s))) < 0) then k_r := k_r + 2 * ((f_s - (k_r - (k_r - f_s))) + ((f_tl + f_e) - (k_r - f_s))); end if;
    elsif k_z = 0 or k_r = 0 then
      k_r := k_z * k_r + (2.75573137070700676789e-06)::float8;
    else
      k_r := fdlibm_fma_wide(a => k_z, b => k_r, c => (2.75573137070700676789e-06)::float8);
    end if;
    if abs(k_z) >= 1e-144 and abs(k_z) <= 1e144 and abs(k_r) >= 1e-144 and abs(k_r) <= 1e144 and abs((-1.98412698298579493134e-04)::float8) <= 1e288 then
      f_p := k_z * k_r;
      f_ah := (k_z * 134217729 - (k_z * 134217729 - k_z));
      f_bh := (k_r * 134217729 - (k_r * 134217729 - k_r));
      f_e := (k_z - f_ah) * (k_r - f_bh) - (((f_p - f_ah * f_bh) - (k_z - f_ah) * f_bh) - f_ah * (k_r - f_bh));
      f_s := (-1.98412698298579493134e-04)::float8 + f_p;
      f_tl := ((-1.98412698298579493134e-04)::float8 - (f_s - (f_s - (-1.98412698298579493134e-04)::float8))) + (f_p - (f_s - (-1.98412698298579493134e-04)::float8));
      f_w := (f_tl - ((f_tl + f_e) - ((f_tl + f_e) - f_tl))) + (f_e - ((f_tl + f_e) - f_tl));
      k_r := f_s + (f_tl + f_e);
      if f_w <> 0 and ((f_s - (k_r - (k_r - f_s))) + ((f_tl + f_e) - (k_r - f_s))) <> 0 and (k_r + 2 * ((f_s - (k_r - (k_r - f_s))) + ((f_tl + f_e) - (k_r - f_s)))) - k_r = 2 * ((f_s - (k_r - (k_r - f_s))) + ((f_tl + f_e) - (k_r - f_s))) and (f_w < 0) = (((f_s - (k_r - (k_r - f_s))) + ((f_tl + f_e) - (k_r - f_s))) < 0) then k_r := k_r + 2 * ((f_s - (k_r - (k_r - f_s))) + ((f_tl + f_e) - (k_r - f_s))); end if;
    elsif k_z = 0 or k_r = 0 then
      k_r := k_z * k_r + (-1.98412698298579493134e-04)::float8;
    else
      k_r := fdlibm_fma_wide(a => k_z, b => k_r, c => (-1.98412698298579493134e-04)::float8);
    end if;
    if abs(k_z) >= 1e-144 and abs(k_z) <= 1e144 and abs(k_r) >= 1e-144 and abs(k_r) <= 1e144 and abs((8.33333333332248946124e-03)::float8) <= 1e288 then
      f_p := k_z * k_r;
      f_ah := (k_z * 134217729 - (k_z * 134217729 - k_z));
      f_bh := (k_r * 134217729 - (k_r * 134217729 - k_r));
      f_e := (k_z - f_ah) * (k_r - f_bh) - (((f_p - f_ah * f_bh) - (k_z - f_ah) * f_bh) - f_ah * (k_r - f_bh));
      f_s := (8.33333333332248946124e-03)::float8 + f_p;
      f_tl := ((8.33333333332248946124e-03)::float8 - (f_s - (f_s - (8.33333333332248946124e-03)::float8))) + (f_p - (f_s - (8.33333333332248946124e-03)::float8));
      f_w := (f_tl - ((f_tl + f_e) - ((f_tl + f_e) - f_tl))) + (f_e - ((f_tl + f_e) - f_tl));
      k_r := f_s + (f_tl + f_e);
      if f_w <> 0 and ((f_s - (k_r - (k_r - f_s))) + ((f_tl + f_e) - (k_r - f_s))) <> 0 and (k_r + 2 * ((f_s - (k_r - (k_r - f_s))) + ((f_tl + f_e) - (k_r - f_s)))) - k_r = 2 * ((f_s - (k_r - (k_r - f_s))) + ((f_tl + f_e) - (k_r - f_s))) and (f_w < 0) = (((f_s - (k_r - (k_r - f_s))) + ((f_tl + f_e) - (k_r - f_s))) < 0) then k_r := k_r + 2 * ((f_s - (k_r - (k_r - f_s))) + ((f_tl + f_e) - (k_r - f_s))); end if;
    elsif k_z = 0 or k_r = 0 then
      k_r := k_z * k_r + (8.33333333332248946124e-03)::float8;
    else
      k_r := fdlibm_fma_wide(a => k_z, b => k_r, c => (8.33333333332248946124e-03)::float8);
    end if;
    if iy = 0 then
      if abs(k_z) >= 1e-144 and abs(k_z) <= 1e144 and abs(k_r) >= 1e-144 and abs(k_r) <= 1e144 and abs((-1.66666666666666324348e-01)::float8) <= 1e288 then
        f_p := k_z * k_r;
        f_ah := (k_z * 134217729 - (k_z * 134217729 - k_z));
        f_bh := (k_r * 134217729 - (k_r * 134217729 - k_r));
        f_e := (k_z - f_ah) * (k_r - f_bh) - (((f_p - f_ah * f_bh) - (k_z - f_ah) * f_bh) - f_ah * (k_r - f_bh));
        f_s := (-1.66666666666666324348e-01)::float8 + f_p;
        f_tl := ((-1.66666666666666324348e-01)::float8 - (f_s - (f_s - (-1.66666666666666324348e-01)::float8))) + (f_p - (f_s - (-1.66666666666666324348e-01)::float8));
        f_w := (f_tl - ((f_tl + f_e) - ((f_tl + f_e) - f_tl))) + (f_e - ((f_tl + f_e) - f_tl));
        k_u := f_s + (f_tl + f_e);
        if f_w <> 0 and ((f_s - (k_u - (k_u - f_s))) + ((f_tl + f_e) - (k_u - f_s))) <> 0 and (k_u + 2 * ((f_s - (k_u - (k_u - f_s))) + ((f_tl + f_e) - (k_u - f_s)))) - k_u = 2 * ((f_s - (k_u - (k_u - f_s))) + ((f_tl + f_e) - (k_u - f_s))) and (f_w < 0) = (((f_s - (k_u - (k_u - f_s))) + ((f_tl + f_e) - (k_u - f_s))) < 0) then k_u := k_u + 2 * ((f_s - (k_u - (k_u - f_s))) + ((f_tl + f_e) - (k_u - f_s))); end if;
      elsif k_z = 0 or k_r = 0 then
        k_u := k_z * k_r + (-1.66666666666666324348e-01)::float8;
      else
        k_u := fdlibm_fma_wide(a => k_z, b => k_r, c => (-1.66666666666666324348e-01)::float8);
      end if;
      if abs(k_v) >= 1e-144 and abs(k_v) <= 1e144 and abs(k_u) >= 1e-144 and abs(k_u) <= 1e144 and abs(x) <= 1e288 then
        f_p := k_v * k_u;
        f_ah := (k_v * 134217729 - (k_v * 134217729 - k_v));
        f_bh := (k_u * 134217729 - (k_u * 134217729 - k_u));
        f_e := (k_v - f_ah) * (k_u - f_bh) - (((f_p - f_ah * f_bh) - (k_v - f_ah) * f_bh) - f_ah * (k_u - f_bh));
        f_s := x + f_p;
        f_tl := (x - (f_s - (f_s - x))) + (f_p - (f_s - x));
        f_w := (f_tl - ((f_tl + f_e) - ((f_tl + f_e) - f_tl))) + (f_e - ((f_tl + f_e) - f_tl));
        res := f_s + (f_tl + f_e);
        if f_w <> 0 and ((f_s - (res - (res - f_s))) + ((f_tl + f_e) - (res - f_s))) <> 0 and (res + 2 * ((f_s - (res - (res - f_s))) + ((f_tl + f_e) - (res - f_s)))) - res = 2 * ((f_s - (res - (res - f_s))) + ((f_tl + f_e) - (res - f_s))) and (f_w < 0) = (((f_s - (res - (res - f_s))) + ((f_tl + f_e) - (res - f_s))) < 0) then res := res + 2 * ((f_s - (res - (res - f_s))) + ((f_tl + f_e) - (res - f_s))); end if;
      elsif k_v = 0 or k_u = 0 then
        res := k_v * k_u + x;
      else
        res := fdlibm_fma_wide(a => k_v, b => k_u, c => x);
      end if;
    else
      if abs(k_z) >= 1e-144 and abs(k_z) <= 1e144 and abs((0.5 * y - k_v * k_r)::float8) >= 1e-144 and abs((0.5 * y - k_v * k_r)::float8) <= 1e144 and abs(-y) <= 1e288 then
        f_p := k_z * (0.5 * y - k_v * k_r)::float8;
        f_ah := (k_z * 134217729 - (k_z * 134217729 - k_z));
        f_e := (k_z - f_ah) * ((0.5 * y - k_v * k_r)::float8 - ((0.5 * y - k_v * k_r)::float8 * 134217729 - ((0.5 * y - k_v * k_r)::float8 * 134217729 - (0.5 * y - k_v * k_r)::float8))) - (((f_p - f_ah * ((0.5 * y - k_v * k_r)::float8 * 134217729 - ((0.5 * y - k_v * k_r)::float8 * 134217729 - (0.5 * y - k_v * k_r)::float8))) - (k_z - f_ah) * ((0.5 * y - k_v * k_r)::float8 * 134217729 - ((0.5 * y - k_v * k_r)::float8 * 134217729 - (0.5 * y - k_v * k_r)::float8))) - f_ah * ((0.5 * y - k_v * k_r)::float8 - ((0.5 * y - k_v * k_r)::float8 * 134217729 - ((0.5 * y - k_v * k_r)::float8 * 134217729 - (0.5 * y - k_v * k_r)::float8))));
        f_s := -y + f_p;
        f_tl := (-y - (f_s - (f_s - -y))) + (f_p - (f_s - -y));
        f_w := (f_tl - ((f_tl + f_e) - ((f_tl + f_e) - f_tl))) + (f_e - ((f_tl + f_e) - f_tl));
        k_u := f_s + (f_tl + f_e);
        if f_w <> 0 and ((f_s - (k_u - (k_u - f_s))) + ((f_tl + f_e) - (k_u - f_s))) <> 0 and (k_u + 2 * ((f_s - (k_u - (k_u - f_s))) + ((f_tl + f_e) - (k_u - f_s)))) - k_u = 2 * ((f_s - (k_u - (k_u - f_s))) + ((f_tl + f_e) - (k_u - f_s))) and (f_w < 0) = (((f_s - (k_u - (k_u - f_s))) + ((f_tl + f_e) - (k_u - f_s))) < 0) then k_u := k_u + 2 * ((f_s - (k_u - (k_u - f_s))) + ((f_tl + f_e) - (k_u - f_s))); end if;
      elsif k_z = 0 or (0.5 * y - k_v * k_r)::float8 = 0 then
        k_u := k_z * (0.5 * y - k_v * k_r)::float8 + -y;
      else
        k_u := fdlibm_fma_wide(a => k_z, b => (0.5 * y - k_v * k_r)::float8, c => -y);
      end if;
      if abs(-k_v) >= 1e-144 and abs(-k_v) <= 1e144 and abs((-1.66666666666666324348e-01)::float8) >= 1e-144 and abs((-1.66666666666666324348e-01)::float8) <= 1e144 and abs(k_u) <= 1e288 then
        f_p := -k_v * (-1.66666666666666324348e-01)::float8;
        f_ah := (-k_v * 134217729 - (-k_v * 134217729 - -k_v));
        f_e := (-k_v - f_ah) * ((-1.66666666666666324348e-01)::float8 - ((-1.66666666666666324348e-01)::float8 * 134217729 - ((-1.66666666666666324348e-01)::float8 * 134217729 - (-1.66666666666666324348e-01)::float8))) - (((f_p - f_ah * ((-1.66666666666666324348e-01)::float8 * 134217729 - ((-1.66666666666666324348e-01)::float8 * 134217729 - (-1.66666666666666324348e-01)::float8))) - (-k_v - f_ah) * ((-1.66666666666666324348e-01)::float8 * 134217729 - ((-1.66666666666666324348e-01)::float8 * 134217729 - (-1.66666666666666324348e-01)::float8))) - f_ah * ((-1.66666666666666324348e-01)::float8 - ((-1.66666666666666324348e-01)::float8 * 134217729 - ((-1.66666666666666324348e-01)::float8 * 134217729 - (-1.66666666666666324348e-01)::float8))));
        f_s := k_u + f_p;
        f_tl := (k_u - (f_s - (f_s - k_u))) + (f_p - (f_s - k_u));
        f_w := (f_tl - ((f_tl + f_e) - ((f_tl + f_e) - f_tl))) + (f_e - ((f_tl + f_e) - f_tl));
        k_u := f_s + (f_tl + f_e);
        if f_w <> 0 and ((f_s - (k_u - (k_u - f_s))) + ((f_tl + f_e) - (k_u - f_s))) <> 0 and (k_u + 2 * ((f_s - (k_u - (k_u - f_s))) + ((f_tl + f_e) - (k_u - f_s)))) - k_u = 2 * ((f_s - (k_u - (k_u - f_s))) + ((f_tl + f_e) - (k_u - f_s))) and (f_w < 0) = (((f_s - (k_u - (k_u - f_s))) + ((f_tl + f_e) - (k_u - f_s))) < 0) then k_u := k_u + 2 * ((f_s - (k_u - (k_u - f_s))) + ((f_tl + f_e) - (k_u - f_s))); end if;
      elsif -k_v = 0 or (-1.66666666666666324348e-01)::float8 = 0 then
        k_u := -k_v * (-1.66666666666666324348e-01)::float8 + k_u;
      else
        k_u := fdlibm_fma_wide(a => -k_v, b => (-1.66666666666666324348e-01)::float8, c => k_u);
      end if;
      res := x - k_u;
    end if;
  end if;

  return res;
end $$;
-- V8's __kernel_cos: cos(x + y) on [-π/4, π/4]. 0.5 × z is exact (z >= 2^-54), so its fused and unfused forms agree.
create function p3.fdlibm_kernel_cos(x float8, y float8) returns float8 language plpgsql immutable as $$
declare f_a float8; f_b float8; f_c float8; f_p float8; f_ah float8; f_bh float8; f_e float8; f_s float8; f_tl float8; f_w float8; k_ix int; k_hx int; k_x float8; k_y float8; k_z float8; k_v float8; k_r float8; k_u float8; k_q float8; k_w float8; k_a float8; k_t float8; k_s float8;
 res float8;
begin
  k_ix := (int8(float8send(x)) >> 32)::int & 2147483647;
  if k_ix < 0x3E400000 then
    res := 1;
  else
    k_z := x * x;
    if abs(k_z) >= 1e-144 and abs(k_z) <= 1e144 and abs((-1.13596475577881948265e-11)::float8) >= 1e-144 and abs((-1.13596475577881948265e-11)::float8) <= 1e144 and abs((2.08757232129817482790e-09)::float8) <= 1e288 then
      f_p := k_z * (-1.13596475577881948265e-11)::float8;
      f_ah := (k_z * 134217729 - (k_z * 134217729 - k_z));
      f_e := (k_z - f_ah) * ((-1.13596475577881948265e-11)::float8 - ((-1.13596475577881948265e-11)::float8 * 134217729 - ((-1.13596475577881948265e-11)::float8 * 134217729 - (-1.13596475577881948265e-11)::float8))) - (((f_p - f_ah * ((-1.13596475577881948265e-11)::float8 * 134217729 - ((-1.13596475577881948265e-11)::float8 * 134217729 - (-1.13596475577881948265e-11)::float8))) - (k_z - f_ah) * ((-1.13596475577881948265e-11)::float8 * 134217729 - ((-1.13596475577881948265e-11)::float8 * 134217729 - (-1.13596475577881948265e-11)::float8))) - f_ah * ((-1.13596475577881948265e-11)::float8 - ((-1.13596475577881948265e-11)::float8 * 134217729 - ((-1.13596475577881948265e-11)::float8 * 134217729 - (-1.13596475577881948265e-11)::float8))));
      f_s := (2.08757232129817482790e-09)::float8 + f_p;
      f_tl := ((2.08757232129817482790e-09)::float8 - (f_s - (f_s - (2.08757232129817482790e-09)::float8))) + (f_p - (f_s - (2.08757232129817482790e-09)::float8));
      f_w := (f_tl - ((f_tl + f_e) - ((f_tl + f_e) - f_tl))) + (f_e - ((f_tl + f_e) - f_tl));
      k_r := f_s + (f_tl + f_e);
      if f_w <> 0 and ((f_s - (k_r - (k_r - f_s))) + ((f_tl + f_e) - (k_r - f_s))) <> 0 and (k_r + 2 * ((f_s - (k_r - (k_r - f_s))) + ((f_tl + f_e) - (k_r - f_s)))) - k_r = 2 * ((f_s - (k_r - (k_r - f_s))) + ((f_tl + f_e) - (k_r - f_s))) and (f_w < 0) = (((f_s - (k_r - (k_r - f_s))) + ((f_tl + f_e) - (k_r - f_s))) < 0) then k_r := k_r + 2 * ((f_s - (k_r - (k_r - f_s))) + ((f_tl + f_e) - (k_r - f_s))); end if;
    elsif k_z = 0 or (-1.13596475577881948265e-11)::float8 = 0 then
      k_r := k_z * (-1.13596475577881948265e-11)::float8 + (2.08757232129817482790e-09)::float8;
    else
      k_r := fdlibm_fma_wide(a => k_z, b => (-1.13596475577881948265e-11)::float8, c => (2.08757232129817482790e-09)::float8);
    end if;
    if abs(k_z) >= 1e-144 and abs(k_z) <= 1e144 and abs(k_r) >= 1e-144 and abs(k_r) <= 1e144 and abs((-2.75573143513906633035e-07)::float8) <= 1e288 then
      f_p := k_z * k_r;
      f_ah := (k_z * 134217729 - (k_z * 134217729 - k_z));
      f_bh := (k_r * 134217729 - (k_r * 134217729 - k_r));
      f_e := (k_z - f_ah) * (k_r - f_bh) - (((f_p - f_ah * f_bh) - (k_z - f_ah) * f_bh) - f_ah * (k_r - f_bh));
      f_s := (-2.75573143513906633035e-07)::float8 + f_p;
      f_tl := ((-2.75573143513906633035e-07)::float8 - (f_s - (f_s - (-2.75573143513906633035e-07)::float8))) + (f_p - (f_s - (-2.75573143513906633035e-07)::float8));
      f_w := (f_tl - ((f_tl + f_e) - ((f_tl + f_e) - f_tl))) + (f_e - ((f_tl + f_e) - f_tl));
      k_r := f_s + (f_tl + f_e);
      if f_w <> 0 and ((f_s - (k_r - (k_r - f_s))) + ((f_tl + f_e) - (k_r - f_s))) <> 0 and (k_r + 2 * ((f_s - (k_r - (k_r - f_s))) + ((f_tl + f_e) - (k_r - f_s)))) - k_r = 2 * ((f_s - (k_r - (k_r - f_s))) + ((f_tl + f_e) - (k_r - f_s))) and (f_w < 0) = (((f_s - (k_r - (k_r - f_s))) + ((f_tl + f_e) - (k_r - f_s))) < 0) then k_r := k_r + 2 * ((f_s - (k_r - (k_r - f_s))) + ((f_tl + f_e) - (k_r - f_s))); end if;
    elsif k_z = 0 or k_r = 0 then
      k_r := k_z * k_r + (-2.75573143513906633035e-07)::float8;
    else
      k_r := fdlibm_fma_wide(a => k_z, b => k_r, c => (-2.75573143513906633035e-07)::float8);
    end if;
    if abs(k_z) >= 1e-144 and abs(k_z) <= 1e144 and abs(k_r) >= 1e-144 and abs(k_r) <= 1e144 and abs((2.48015872894767294178e-05)::float8) <= 1e288 then
      f_p := k_z * k_r;
      f_ah := (k_z * 134217729 - (k_z * 134217729 - k_z));
      f_bh := (k_r * 134217729 - (k_r * 134217729 - k_r));
      f_e := (k_z - f_ah) * (k_r - f_bh) - (((f_p - f_ah * f_bh) - (k_z - f_ah) * f_bh) - f_ah * (k_r - f_bh));
      f_s := (2.48015872894767294178e-05)::float8 + f_p;
      f_tl := ((2.48015872894767294178e-05)::float8 - (f_s - (f_s - (2.48015872894767294178e-05)::float8))) + (f_p - (f_s - (2.48015872894767294178e-05)::float8));
      f_w := (f_tl - ((f_tl + f_e) - ((f_tl + f_e) - f_tl))) + (f_e - ((f_tl + f_e) - f_tl));
      k_r := f_s + (f_tl + f_e);
      if f_w <> 0 and ((f_s - (k_r - (k_r - f_s))) + ((f_tl + f_e) - (k_r - f_s))) <> 0 and (k_r + 2 * ((f_s - (k_r - (k_r - f_s))) + ((f_tl + f_e) - (k_r - f_s)))) - k_r = 2 * ((f_s - (k_r - (k_r - f_s))) + ((f_tl + f_e) - (k_r - f_s))) and (f_w < 0) = (((f_s - (k_r - (k_r - f_s))) + ((f_tl + f_e) - (k_r - f_s))) < 0) then k_r := k_r + 2 * ((f_s - (k_r - (k_r - f_s))) + ((f_tl + f_e) - (k_r - f_s))); end if;
    elsif k_z = 0 or k_r = 0 then
      k_r := k_z * k_r + (2.48015872894767294178e-05)::float8;
    else
      k_r := fdlibm_fma_wide(a => k_z, b => k_r, c => (2.48015872894767294178e-05)::float8);
    end if;
    if abs(k_z) >= 1e-144 and abs(k_z) <= 1e144 and abs(k_r) >= 1e-144 and abs(k_r) <= 1e144 and abs((-1.38888888888741095749e-03)::float8) <= 1e288 then
      f_p := k_z * k_r;
      f_ah := (k_z * 134217729 - (k_z * 134217729 - k_z));
      f_bh := (k_r * 134217729 - (k_r * 134217729 - k_r));
      f_e := (k_z - f_ah) * (k_r - f_bh) - (((f_p - f_ah * f_bh) - (k_z - f_ah) * f_bh) - f_ah * (k_r - f_bh));
      f_s := (-1.38888888888741095749e-03)::float8 + f_p;
      f_tl := ((-1.38888888888741095749e-03)::float8 - (f_s - (f_s - (-1.38888888888741095749e-03)::float8))) + (f_p - (f_s - (-1.38888888888741095749e-03)::float8));
      f_w := (f_tl - ((f_tl + f_e) - ((f_tl + f_e) - f_tl))) + (f_e - ((f_tl + f_e) - f_tl));
      k_r := f_s + (f_tl + f_e);
      if f_w <> 0 and ((f_s - (k_r - (k_r - f_s))) + ((f_tl + f_e) - (k_r - f_s))) <> 0 and (k_r + 2 * ((f_s - (k_r - (k_r - f_s))) + ((f_tl + f_e) - (k_r - f_s)))) - k_r = 2 * ((f_s - (k_r - (k_r - f_s))) + ((f_tl + f_e) - (k_r - f_s))) and (f_w < 0) = (((f_s - (k_r - (k_r - f_s))) + ((f_tl + f_e) - (k_r - f_s))) < 0) then k_r := k_r + 2 * ((f_s - (k_r - (k_r - f_s))) + ((f_tl + f_e) - (k_r - f_s))); end if;
    elsif k_z = 0 or k_r = 0 then
      k_r := k_z * k_r + (-1.38888888888741095749e-03)::float8;
    else
      k_r := fdlibm_fma_wide(a => k_z, b => k_r, c => (-1.38888888888741095749e-03)::float8);
    end if;
    if abs(k_z) >= 1e-144 and abs(k_z) <= 1e144 and abs(k_r) >= 1e-144 and abs(k_r) <= 1e144 and abs((4.16666666666666019037e-02)::float8) <= 1e288 then
      f_p := k_z * k_r;
      f_ah := (k_z * 134217729 - (k_z * 134217729 - k_z));
      f_bh := (k_r * 134217729 - (k_r * 134217729 - k_r));
      f_e := (k_z - f_ah) * (k_r - f_bh) - (((f_p - f_ah * f_bh) - (k_z - f_ah) * f_bh) - f_ah * (k_r - f_bh));
      f_s := (4.16666666666666019037e-02)::float8 + f_p;
      f_tl := ((4.16666666666666019037e-02)::float8 - (f_s - (f_s - (4.16666666666666019037e-02)::float8))) + (f_p - (f_s - (4.16666666666666019037e-02)::float8));
      f_w := (f_tl - ((f_tl + f_e) - ((f_tl + f_e) - f_tl))) + (f_e - ((f_tl + f_e) - f_tl));
      k_r := f_s + (f_tl + f_e);
      if f_w <> 0 and ((f_s - (k_r - (k_r - f_s))) + ((f_tl + f_e) - (k_r - f_s))) <> 0 and (k_r + 2 * ((f_s - (k_r - (k_r - f_s))) + ((f_tl + f_e) - (k_r - f_s)))) - k_r = 2 * ((f_s - (k_r - (k_r - f_s))) + ((f_tl + f_e) - (k_r - f_s))) and (f_w < 0) = (((f_s - (k_r - (k_r - f_s))) + ((f_tl + f_e) - (k_r - f_s))) < 0) then k_r := k_r + 2 * ((f_s - (k_r - (k_r - f_s))) + ((f_tl + f_e) - (k_r - f_s))); end if;
    elsif k_z = 0 or k_r = 0 then
      k_r := k_z * k_r + (4.16666666666666019037e-02)::float8;
    else
      k_r := fdlibm_fma_wide(a => k_z, b => k_r, c => (4.16666666666666019037e-02)::float8);
    end if;
    k_r := k_z * k_r;
    f_c := -(x * y);
    if abs(k_z) >= 1e-144 and abs(k_z) <= 1e144 and abs(k_r) >= 1e-144 and abs(k_r) <= 1e144 and abs(f_c) <= 1e288 then
      f_p := k_z * k_r;
      f_ah := (k_z * 134217729 - (k_z * 134217729 - k_z));
      f_bh := (k_r * 134217729 - (k_r * 134217729 - k_r));
      f_e := (k_z - f_ah) * (k_r - f_bh) - (((f_p - f_ah * f_bh) - (k_z - f_ah) * f_bh) - f_ah * (k_r - f_bh));
      f_s := f_c + f_p;
      f_tl := (f_c - (f_s - (f_s - f_c))) + (f_p - (f_s - f_c));
      f_w := (f_tl - ((f_tl + f_e) - ((f_tl + f_e) - f_tl))) + (f_e - ((f_tl + f_e) - f_tl));
      k_u := f_s + (f_tl + f_e);
      if f_w <> 0 and ((f_s - (k_u - (k_u - f_s))) + ((f_tl + f_e) - (k_u - f_s))) <> 0 and (k_u + 2 * ((f_s - (k_u - (k_u - f_s))) + ((f_tl + f_e) - (k_u - f_s)))) - k_u = 2 * ((f_s - (k_u - (k_u - f_s))) + ((f_tl + f_e) - (k_u - f_s))) and (f_w < 0) = (((f_s - (k_u - (k_u - f_s))) + ((f_tl + f_e) - (k_u - f_s))) < 0) then k_u := k_u + 2 * ((f_s - (k_u - (k_u - f_s))) + ((f_tl + f_e) - (k_u - f_s))); end if;
    elsif k_z = 0 or k_r = 0 then
      k_u := k_z * k_r + f_c;
    else
      k_u := fdlibm_fma_wide(a => k_z, b => k_r, c => f_c);
    end if;
    if k_ix < 0x3FD33333 then
      res := 1 - (0.5 * k_z - k_u);
    else
      k_q := case when k_ix > 0x3FE90000 then 0.28125 else (trunc((abs(x)) * (('{2.2250738585072014e-308,4.1045368012983762e-289,7.571533991467358e-270,1.3967014978599092e-250,2.5764595078388533e-231,4.7527289157379e-212,8.767237396033612e-193,1.617269844780878e-173,2.983336292480083e-154,5.503284107318959e-135,1.0151767349262597e-115,1.8726705418768793e-96,3.454467422037778e-77,6.372367644529809e-58,1.1754943508222875e-38,2.168404344971009e-19,4,73786976294838210000,1.361129467683754e+39,2.5108406941546723e+58,4.631683569492648e+77,8.54394814368364e+96,1.5760802478557792e+116,2.9073548971824276e+135,5.363123171977039e+154,9.893216058924181e+173,1.824976247048878e+193,3.366486976990959e+212,6.210072369202836e+231,1.1455561567389984e+251,2.113178124542661e+270,3.89812560456e+289}'::float8[])[(((1043 - (((k_ix) >> 20) & 2047)) + 1022) >> 6) + 1] * ('{1,2,4,8,16,32,64,128,256,512,1024,2048,4096,8192,16384,32768,65536,131072,262144,524288,1048576,2097152,4194304,8388608,16777216,33554432,67108864,134217728,268435456,536870912,1073741824,2147483648,4294967296,8589934592,17179869184,34359738368,68719476736,137438953472,274877906944,549755813888,1099511627776,2199023255552,4398046511104,8796093022208,17592186044416,35184372088832,70368744177664,140737488355328,281474976710656,562949953421312,1125899906842624,2251799813685248,4503599627370496,9007199254740992,18014398509481984,36028797018963970,72057594037927940,144115188075855870,288230376151711740,576460752303423500,1152921504606847000,2305843009213694000,4611686018427388000,9223372036854776000}'::float8[])[(((1043 - (((k_ix) >> 20) & 2047)) + 1022) & 63) + 1])) * (('{2.2250738585072014e-308,4.1045368012983762e-289,7.571533991467358e-270,1.3967014978599092e-250,2.5764595078388533e-231,4.7527289157379e-212,8.767237396033612e-193,1.617269844780878e-173,2.983336292480083e-154,5.503284107318959e-135,1.0151767349262597e-115,1.8726705418768793e-96,3.454467422037778e-77,6.372367644529809e-58,1.1754943508222875e-38,2.168404344971009e-19,4,73786976294838210000,1.361129467683754e+39,2.5108406941546723e+58,4.631683569492648e+77,8.54394814368364e+96,1.5760802478557792e+116,2.9073548971824276e+135,5.363123171977039e+154,9.893216058924181e+173,1.824976247048878e+193,3.366486976990959e+212,6.210072369202836e+231,1.1455561567389984e+251,2.113178124542661e+270,3.89812560456e+289}'::float8[])[((((((k_ix) >> 20) & 2047) - 1043) + 1022) >> 6) + 1] * ('{1,2,4,8,16,32,64,128,256,512,1024,2048,4096,8192,16384,32768,65536,131072,262144,524288,1048576,2097152,4194304,8388608,16777216,33554432,67108864,134217728,268435456,536870912,1073741824,2147483648,4294967296,8589934592,17179869184,34359738368,68719476736,137438953472,274877906944,549755813888,1099511627776,2199023255552,4398046511104,8796093022208,17592186044416,35184372088832,70368744177664,140737488355328,281474976710656,562949953421312,1125899906842624,2251799813685248,4503599627370496,9007199254740992,18014398509481984,36028797018963970,72057594037927940,144115188075855870,288230376151711740,576460752303423500,1152921504606847000,2305843009213694000,4611686018427388000,9223372036854776000}'::float8[])[((((((k_ix) >> 20) & 2047) - 1043) + 1022) & 63) + 1])) * 0.25 end;
      res := (1 - k_q) - ((0.5 * k_z - k_q) - k_u);
    end if;
  end if;

  return res;
end $$;
-- V8's __kernel_tan: tan(x + y) on [-π/4, π/4] for iy = 1, -1 / tan(x + y) for iy = -1. 2 × a here is exact.
create function p3.fdlibm_kernel_tan(iy int, x float8, y float8) returns float8 language plpgsql immutable as $$
declare f_a float8; f_b float8; f_c float8; f_p float8; f_ah float8; f_bh float8; f_e float8; f_s float8; f_tl float8; f_w float8; k_ix int; k_hx int; k_x float8; k_y float8; k_z float8; k_v float8; k_r float8; k_u float8; k_q float8; k_w float8; k_a float8; k_t float8; k_s float8;
 res float8;
begin
  k_x := x;
  k_y := y;
  k_hx := (int8(float8send(k_x)) >> 32)::int;
  k_ix := k_hx & 2147483647;
  if k_ix < 0x3E300000 then
    if k_ix = 0 and (int8(float8send(k_x)) & 4294967295) = 0 and iy = -1 then
      res := 'Infinity';
    elsif iy = 1 then
      res := k_x;
    else
      k_w := k_x + k_y;
      k_z := (trunc((k_w) * (('{2.2250738585072014e-308,4.1045368012983762e-289,7.571533991467358e-270,1.3967014978599092e-250,2.5764595078388533e-231,4.7527289157379e-212,8.767237396033612e-193,1.617269844780878e-173,2.983336292480083e-154,5.503284107318959e-135,1.0151767349262597e-115,1.8726705418768793e-96,3.454467422037778e-77,6.372367644529809e-58,1.1754943508222875e-38,2.168404344971009e-19,4,73786976294838210000,1.361129467683754e+39,2.5108406941546723e+58,4.631683569492648e+77,8.54394814368364e+96,1.5760802478557792e+116,2.9073548971824276e+135,5.363123171977039e+154,9.893216058924181e+173,1.824976247048878e+193,3.366486976990959e+212,6.210072369202836e+231,1.1455561567389984e+251,2.113178124542661e+270,3.89812560456e+289}'::float8[])[(((1043 - ((((int8(float8send(k_w)) >> 32)::int) >> 20) & 2047)) + 1022) >> 6) + 1] * ('{1,2,4,8,16,32,64,128,256,512,1024,2048,4096,8192,16384,32768,65536,131072,262144,524288,1048576,2097152,4194304,8388608,16777216,33554432,67108864,134217728,268435456,536870912,1073741824,2147483648,4294967296,8589934592,17179869184,34359738368,68719476736,137438953472,274877906944,549755813888,1099511627776,2199023255552,4398046511104,8796093022208,17592186044416,35184372088832,70368744177664,140737488355328,281474976710656,562949953421312,1125899906842624,2251799813685248,4503599627370496,9007199254740992,18014398509481984,36028797018963970,72057594037927940,144115188075855870,288230376151711740,576460752303423500,1152921504606847000,2305843009213694000,4611686018427388000,9223372036854776000}'::float8[])[(((1043 - ((((int8(float8send(k_w)) >> 32)::int) >> 20) & 2047)) + 1022) & 63) + 1])) * (('{2.2250738585072014e-308,4.1045368012983762e-289,7.571533991467358e-270,1.3967014978599092e-250,2.5764595078388533e-231,4.7527289157379e-212,8.767237396033612e-193,1.617269844780878e-173,2.983336292480083e-154,5.503284107318959e-135,1.0151767349262597e-115,1.8726705418768793e-96,3.454467422037778e-77,6.372367644529809e-58,1.1754943508222875e-38,2.168404344971009e-19,4,73786976294838210000,1.361129467683754e+39,2.5108406941546723e+58,4.631683569492648e+77,8.54394814368364e+96,1.5760802478557792e+116,2.9073548971824276e+135,5.363123171977039e+154,9.893216058924181e+173,1.824976247048878e+193,3.366486976990959e+212,6.210072369202836e+231,1.1455561567389984e+251,2.113178124542661e+270,3.89812560456e+289}'::float8[])[(((((((int8(float8send(k_w)) >> 32)::int) >> 20) & 2047) - 1043) + 1022) >> 6) + 1] * ('{1,2,4,8,16,32,64,128,256,512,1024,2048,4096,8192,16384,32768,65536,131072,262144,524288,1048576,2097152,4194304,8388608,16777216,33554432,67108864,134217728,268435456,536870912,1073741824,2147483648,4294967296,8589934592,17179869184,34359738368,68719476736,137438953472,274877906944,549755813888,1099511627776,2199023255552,4398046511104,8796093022208,17592186044416,35184372088832,70368744177664,140737488355328,281474976710656,562949953421312,1125899906842624,2251799813685248,4503599627370496,9007199254740992,18014398509481984,36028797018963970,72057594037927940,144115188075855870,288230376151711740,576460752303423500,1152921504606847000,2305843009213694000,4611686018427388000,9223372036854776000}'::float8[])[(((((((int8(float8send(k_w)) >> 32)::int) >> 20) & 2047) - 1043) + 1022) & 63) + 1]));
      k_v := k_y - (k_z - k_x);
      k_a := -1 / k_w;
      k_t := (trunc((k_a) * (('{2.2250738585072014e-308,4.1045368012983762e-289,7.571533991467358e-270,1.3967014978599092e-250,2.5764595078388533e-231,4.7527289157379e-212,8.767237396033612e-193,1.617269844780878e-173,2.983336292480083e-154,5.503284107318959e-135,1.0151767349262597e-115,1.8726705418768793e-96,3.454467422037778e-77,6.372367644529809e-58,1.1754943508222875e-38,2.168404344971009e-19,4,73786976294838210000,1.361129467683754e+39,2.5108406941546723e+58,4.631683569492648e+77,8.54394814368364e+96,1.5760802478557792e+116,2.9073548971824276e+135,5.363123171977039e+154,9.893216058924181e+173,1.824976247048878e+193,3.366486976990959e+212,6.210072369202836e+231,1.1455561567389984e+251,2.113178124542661e+270,3.89812560456e+289}'::float8[])[(((1043 - ((((int8(float8send(k_a)) >> 32)::int) >> 20) & 2047)) + 1022) >> 6) + 1] * ('{1,2,4,8,16,32,64,128,256,512,1024,2048,4096,8192,16384,32768,65536,131072,262144,524288,1048576,2097152,4194304,8388608,16777216,33554432,67108864,134217728,268435456,536870912,1073741824,2147483648,4294967296,8589934592,17179869184,34359738368,68719476736,137438953472,274877906944,549755813888,1099511627776,2199023255552,4398046511104,8796093022208,17592186044416,35184372088832,70368744177664,140737488355328,281474976710656,562949953421312,1125899906842624,2251799813685248,4503599627370496,9007199254740992,18014398509481984,36028797018963970,72057594037927940,144115188075855870,288230376151711740,576460752303423500,1152921504606847000,2305843009213694000,4611686018427388000,9223372036854776000}'::float8[])[(((1043 - ((((int8(float8send(k_a)) >> 32)::int) >> 20) & 2047)) + 1022) & 63) + 1])) * (('{2.2250738585072014e-308,4.1045368012983762e-289,7.571533991467358e-270,1.3967014978599092e-250,2.5764595078388533e-231,4.7527289157379e-212,8.767237396033612e-193,1.617269844780878e-173,2.983336292480083e-154,5.503284107318959e-135,1.0151767349262597e-115,1.8726705418768793e-96,3.454467422037778e-77,6.372367644529809e-58,1.1754943508222875e-38,2.168404344971009e-19,4,73786976294838210000,1.361129467683754e+39,2.5108406941546723e+58,4.631683569492648e+77,8.54394814368364e+96,1.5760802478557792e+116,2.9073548971824276e+135,5.363123171977039e+154,9.893216058924181e+173,1.824976247048878e+193,3.366486976990959e+212,6.210072369202836e+231,1.1455561567389984e+251,2.113178124542661e+270,3.89812560456e+289}'::float8[])[(((((((int8(float8send(k_a)) >> 32)::int) >> 20) & 2047) - 1043) + 1022) >> 6) + 1] * ('{1,2,4,8,16,32,64,128,256,512,1024,2048,4096,8192,16384,32768,65536,131072,262144,524288,1048576,2097152,4194304,8388608,16777216,33554432,67108864,134217728,268435456,536870912,1073741824,2147483648,4294967296,8589934592,17179869184,34359738368,68719476736,137438953472,274877906944,549755813888,1099511627776,2199023255552,4398046511104,8796093022208,17592186044416,35184372088832,70368744177664,140737488355328,281474976710656,562949953421312,1125899906842624,2251799813685248,4503599627370496,9007199254740992,18014398509481984,36028797018963970,72057594037927940,144115188075855870,288230376151711740,576460752303423500,1152921504606847000,2305843009213694000,4611686018427388000,9223372036854776000}'::float8[])[(((((((int8(float8send(k_a)) >> 32)::int) >> 20) & 2047) - 1043) + 1022) & 63) + 1]));
      if abs(k_t) >= 1e-144 and abs(k_t) <= 1e144 and abs(k_z) >= 1e-144 and abs(k_z) <= 1e144 and abs((1)::float8) <= 1e288 then
        f_p := k_t * k_z;
        f_ah := (k_t * 134217729 - (k_t * 134217729 - k_t));
        f_bh := (k_z * 134217729 - (k_z * 134217729 - k_z));
        f_e := (k_t - f_ah) * (k_z - f_bh) - (((f_p - f_ah * f_bh) - (k_t - f_ah) * f_bh) - f_ah * (k_z - f_bh));
        f_s := (1)::float8 + f_p;
        f_tl := ((1)::float8 - (f_s - (f_s - (1)::float8))) + (f_p - (f_s - (1)::float8));
        f_w := (f_tl - ((f_tl + f_e) - ((f_tl + f_e) - f_tl))) + (f_e - ((f_tl + f_e) - f_tl));
        k_s := f_s + (f_tl + f_e);
        if f_w <> 0 and ((f_s - (k_s - (k_s - f_s))) + ((f_tl + f_e) - (k_s - f_s))) <> 0 and (k_s + 2 * ((f_s - (k_s - (k_s - f_s))) + ((f_tl + f_e) - (k_s - f_s)))) - k_s = 2 * ((f_s - (k_s - (k_s - f_s))) + ((f_tl + f_e) - (k_s - f_s))) and (f_w < 0) = (((f_s - (k_s - (k_s - f_s))) + ((f_tl + f_e) - (k_s - f_s))) < 0) then k_s := k_s + 2 * ((f_s - (k_s - (k_s - f_s))) + ((f_tl + f_e) - (k_s - f_s))); end if;
      elsif k_t = 0 or k_z = 0 then
        k_s := k_t * k_z + (1)::float8;
      else
        k_s := fdlibm_fma_wide(a => k_t, b => k_z, c => (1)::float8);
      end if;
      if abs(k_t) >= 1e-144 and abs(k_t) <= 1e144 and abs(k_v) >= 1e-144 and abs(k_v) <= 1e144 and abs(k_s) <= 1e288 then
        f_p := k_t * k_v;
        f_ah := (k_t * 134217729 - (k_t * 134217729 - k_t));
        f_bh := (k_v * 134217729 - (k_v * 134217729 - k_v));
        f_e := (k_t - f_ah) * (k_v - f_bh) - (((f_p - f_ah * f_bh) - (k_t - f_ah) * f_bh) - f_ah * (k_v - f_bh));
        f_s := k_s + f_p;
        f_tl := (k_s - (f_s - (f_s - k_s))) + (f_p - (f_s - k_s));
        f_w := (f_tl - ((f_tl + f_e) - ((f_tl + f_e) - f_tl))) + (f_e - ((f_tl + f_e) - f_tl));
        k_u := f_s + (f_tl + f_e);
        if f_w <> 0 and ((f_s - (k_u - (k_u - f_s))) + ((f_tl + f_e) - (k_u - f_s))) <> 0 and (k_u + 2 * ((f_s - (k_u - (k_u - f_s))) + ((f_tl + f_e) - (k_u - f_s)))) - k_u = 2 * ((f_s - (k_u - (k_u - f_s))) + ((f_tl + f_e) - (k_u - f_s))) and (f_w < 0) = (((f_s - (k_u - (k_u - f_s))) + ((f_tl + f_e) - (k_u - f_s))) < 0) then k_u := k_u + 2 * ((f_s - (k_u - (k_u - f_s))) + ((f_tl + f_e) - (k_u - f_s))); end if;
      elsif k_t = 0 or k_v = 0 then
        k_u := k_t * k_v + k_s;
      else
        k_u := fdlibm_fma_wide(a => k_t, b => k_v, c => k_s);
      end if;
      if abs(k_a) >= 1e-144 and abs(k_a) <= 1e144 and abs(k_u) >= 1e-144 and abs(k_u) <= 1e144 and abs(k_t) <= 1e288 then
        f_p := k_a * k_u;
        f_ah := (k_a * 134217729 - (k_a * 134217729 - k_a));
        f_bh := (k_u * 134217729 - (k_u * 134217729 - k_u));
        f_e := (k_a - f_ah) * (k_u - f_bh) - (((f_p - f_ah * f_bh) - (k_a - f_ah) * f_bh) - f_ah * (k_u - f_bh));
        f_s := k_t + f_p;
        f_tl := (k_t - (f_s - (f_s - k_t))) + (f_p - (f_s - k_t));
        f_w := (f_tl - ((f_tl + f_e) - ((f_tl + f_e) - f_tl))) + (f_e - ((f_tl + f_e) - f_tl));
        res := f_s + (f_tl + f_e);
        if f_w <> 0 and ((f_s - (res - (res - f_s))) + ((f_tl + f_e) - (res - f_s))) <> 0 and (res + 2 * ((f_s - (res - (res - f_s))) + ((f_tl + f_e) - (res - f_s)))) - res = 2 * ((f_s - (res - (res - f_s))) + ((f_tl + f_e) - (res - f_s))) and (f_w < 0) = (((f_s - (res - (res - f_s))) + ((f_tl + f_e) - (res - f_s))) < 0) then res := res + 2 * ((f_s - (res - (res - f_s))) + ((f_tl + f_e) - (res - f_s))); end if;
      elsif k_a = 0 or k_u = 0 then
        res := k_a * k_u + k_t;
      else
        res := fdlibm_fma_wide(a => k_a, b => k_u, c => k_t);
      end if;
    end if;
  else
    if k_ix >= 0x3FE59428 then
      if k_hx < 0 then k_x := -k_x; k_y := -k_y; end if;
      k_z := 7.85398163397448278999e-01 - k_x;
      k_w := 3.06161699786838301793e-17 - k_y;
      k_x := k_z + k_w;
      k_y := 0;
    end if;
    k_z := k_x * k_x;
    k_w := k_z * k_z;
    if abs(k_w) >= 1e-144 and abs(k_w) <= 1e144 and abs((-1.85586374855275456654e-05)::float8) >= 1e-144 and abs((-1.85586374855275456654e-05)::float8) <= 1e144 and abs((7.81794442939557092300e-05)::float8) <= 1e288 then
      f_p := k_w * (-1.85586374855275456654e-05)::float8;
      f_ah := (k_w * 134217729 - (k_w * 134217729 - k_w));
      f_e := (k_w - f_ah) * ((-1.85586374855275456654e-05)::float8 - ((-1.85586374855275456654e-05)::float8 * 134217729 - ((-1.85586374855275456654e-05)::float8 * 134217729 - (-1.85586374855275456654e-05)::float8))) - (((f_p - f_ah * ((-1.85586374855275456654e-05)::float8 * 134217729 - ((-1.85586374855275456654e-05)::float8 * 134217729 - (-1.85586374855275456654e-05)::float8))) - (k_w - f_ah) * ((-1.85586374855275456654e-05)::float8 * 134217729 - ((-1.85586374855275456654e-05)::float8 * 134217729 - (-1.85586374855275456654e-05)::float8))) - f_ah * ((-1.85586374855275456654e-05)::float8 - ((-1.85586374855275456654e-05)::float8 * 134217729 - ((-1.85586374855275456654e-05)::float8 * 134217729 - (-1.85586374855275456654e-05)::float8))));
      f_s := (7.81794442939557092300e-05)::float8 + f_p;
      f_tl := ((7.81794442939557092300e-05)::float8 - (f_s - (f_s - (7.81794442939557092300e-05)::float8))) + (f_p - (f_s - (7.81794442939557092300e-05)::float8));
      f_w := (f_tl - ((f_tl + f_e) - ((f_tl + f_e) - f_tl))) + (f_e - ((f_tl + f_e) - f_tl));
      k_r := f_s + (f_tl + f_e);
      if f_w <> 0 and ((f_s - (k_r - (k_r - f_s))) + ((f_tl + f_e) - (k_r - f_s))) <> 0 and (k_r + 2 * ((f_s - (k_r - (k_r - f_s))) + ((f_tl + f_e) - (k_r - f_s)))) - k_r = 2 * ((f_s - (k_r - (k_r - f_s))) + ((f_tl + f_e) - (k_r - f_s))) and (f_w < 0) = (((f_s - (k_r - (k_r - f_s))) + ((f_tl + f_e) - (k_r - f_s))) < 0) then k_r := k_r + 2 * ((f_s - (k_r - (k_r - f_s))) + ((f_tl + f_e) - (k_r - f_s))); end if;
    elsif k_w = 0 or (-1.85586374855275456654e-05)::float8 = 0 then
      k_r := k_w * (-1.85586374855275456654e-05)::float8 + (7.81794442939557092300e-05)::float8;
    else
      k_r := fdlibm_fma_wide(a => k_w, b => (-1.85586374855275456654e-05)::float8, c => (7.81794442939557092300e-05)::float8);
    end if;
    if abs(k_w) >= 1e-144 and abs(k_w) <= 1e144 and abs(k_r) >= 1e-144 and abs(k_r) <= 1e144 and abs((5.88041240820264096874e-04)::float8) <= 1e288 then
      f_p := k_w * k_r;
      f_ah := (k_w * 134217729 - (k_w * 134217729 - k_w));
      f_bh := (k_r * 134217729 - (k_r * 134217729 - k_r));
      f_e := (k_w - f_ah) * (k_r - f_bh) - (((f_p - f_ah * f_bh) - (k_w - f_ah) * f_bh) - f_ah * (k_r - f_bh));
      f_s := (5.88041240820264096874e-04)::float8 + f_p;
      f_tl := ((5.88041240820264096874e-04)::float8 - (f_s - (f_s - (5.88041240820264096874e-04)::float8))) + (f_p - (f_s - (5.88041240820264096874e-04)::float8));
      f_w := (f_tl - ((f_tl + f_e) - ((f_tl + f_e) - f_tl))) + (f_e - ((f_tl + f_e) - f_tl));
      k_r := f_s + (f_tl + f_e);
      if f_w <> 0 and ((f_s - (k_r - (k_r - f_s))) + ((f_tl + f_e) - (k_r - f_s))) <> 0 and (k_r + 2 * ((f_s - (k_r - (k_r - f_s))) + ((f_tl + f_e) - (k_r - f_s)))) - k_r = 2 * ((f_s - (k_r - (k_r - f_s))) + ((f_tl + f_e) - (k_r - f_s))) and (f_w < 0) = (((f_s - (k_r - (k_r - f_s))) + ((f_tl + f_e) - (k_r - f_s))) < 0) then k_r := k_r + 2 * ((f_s - (k_r - (k_r - f_s))) + ((f_tl + f_e) - (k_r - f_s))); end if;
    elsif k_w = 0 or k_r = 0 then
      k_r := k_w * k_r + (5.88041240820264096874e-04)::float8;
    else
      k_r := fdlibm_fma_wide(a => k_w, b => k_r, c => (5.88041240820264096874e-04)::float8);
    end if;
    if abs(k_w) >= 1e-144 and abs(k_w) <= 1e144 and abs(k_r) >= 1e-144 and abs(k_r) <= 1e144 and abs((3.59207910759131235356e-03)::float8) <= 1e288 then
      f_p := k_w * k_r;
      f_ah := (k_w * 134217729 - (k_w * 134217729 - k_w));
      f_bh := (k_r * 134217729 - (k_r * 134217729 - k_r));
      f_e := (k_w - f_ah) * (k_r - f_bh) - (((f_p - f_ah * f_bh) - (k_w - f_ah) * f_bh) - f_ah * (k_r - f_bh));
      f_s := (3.59207910759131235356e-03)::float8 + f_p;
      f_tl := ((3.59207910759131235356e-03)::float8 - (f_s - (f_s - (3.59207910759131235356e-03)::float8))) + (f_p - (f_s - (3.59207910759131235356e-03)::float8));
      f_w := (f_tl - ((f_tl + f_e) - ((f_tl + f_e) - f_tl))) + (f_e - ((f_tl + f_e) - f_tl));
      k_r := f_s + (f_tl + f_e);
      if f_w <> 0 and ((f_s - (k_r - (k_r - f_s))) + ((f_tl + f_e) - (k_r - f_s))) <> 0 and (k_r + 2 * ((f_s - (k_r - (k_r - f_s))) + ((f_tl + f_e) - (k_r - f_s)))) - k_r = 2 * ((f_s - (k_r - (k_r - f_s))) + ((f_tl + f_e) - (k_r - f_s))) and (f_w < 0) = (((f_s - (k_r - (k_r - f_s))) + ((f_tl + f_e) - (k_r - f_s))) < 0) then k_r := k_r + 2 * ((f_s - (k_r - (k_r - f_s))) + ((f_tl + f_e) - (k_r - f_s))); end if;
    elsif k_w = 0 or k_r = 0 then
      k_r := k_w * k_r + (3.59207910759131235356e-03)::float8;
    else
      k_r := fdlibm_fma_wide(a => k_w, b => k_r, c => (3.59207910759131235356e-03)::float8);
    end if;
    if abs(k_w) >= 1e-144 and abs(k_w) <= 1e144 and abs(k_r) >= 1e-144 and abs(k_r) <= 1e144 and abs((2.18694882948595424599e-02)::float8) <= 1e288 then
      f_p := k_w * k_r;
      f_ah := (k_w * 134217729 - (k_w * 134217729 - k_w));
      f_bh := (k_r * 134217729 - (k_r * 134217729 - k_r));
      f_e := (k_w - f_ah) * (k_r - f_bh) - (((f_p - f_ah * f_bh) - (k_w - f_ah) * f_bh) - f_ah * (k_r - f_bh));
      f_s := (2.18694882948595424599e-02)::float8 + f_p;
      f_tl := ((2.18694882948595424599e-02)::float8 - (f_s - (f_s - (2.18694882948595424599e-02)::float8))) + (f_p - (f_s - (2.18694882948595424599e-02)::float8));
      f_w := (f_tl - ((f_tl + f_e) - ((f_tl + f_e) - f_tl))) + (f_e - ((f_tl + f_e) - f_tl));
      k_r := f_s + (f_tl + f_e);
      if f_w <> 0 and ((f_s - (k_r - (k_r - f_s))) + ((f_tl + f_e) - (k_r - f_s))) <> 0 and (k_r + 2 * ((f_s - (k_r - (k_r - f_s))) + ((f_tl + f_e) - (k_r - f_s)))) - k_r = 2 * ((f_s - (k_r - (k_r - f_s))) + ((f_tl + f_e) - (k_r - f_s))) and (f_w < 0) = (((f_s - (k_r - (k_r - f_s))) + ((f_tl + f_e) - (k_r - f_s))) < 0) then k_r := k_r + 2 * ((f_s - (k_r - (k_r - f_s))) + ((f_tl + f_e) - (k_r - f_s))); end if;
    elsif k_w = 0 or k_r = 0 then
      k_r := k_w * k_r + (2.18694882948595424599e-02)::float8;
    else
      k_r := fdlibm_fma_wide(a => k_w, b => k_r, c => (2.18694882948595424599e-02)::float8);
    end if;
    if abs(k_w) >= 1e-144 and abs(k_w) <= 1e144 and abs(k_r) >= 1e-144 and abs(k_r) <= 1e144 and abs((1.33333333333201242699e-01)::float8) <= 1e288 then
      f_p := k_w * k_r;
      f_ah := (k_w * 134217729 - (k_w * 134217729 - k_w));
      f_bh := (k_r * 134217729 - (k_r * 134217729 - k_r));
      f_e := (k_w - f_ah) * (k_r - f_bh) - (((f_p - f_ah * f_bh) - (k_w - f_ah) * f_bh) - f_ah * (k_r - f_bh));
      f_s := (1.33333333333201242699e-01)::float8 + f_p;
      f_tl := ((1.33333333333201242699e-01)::float8 - (f_s - (f_s - (1.33333333333201242699e-01)::float8))) + (f_p - (f_s - (1.33333333333201242699e-01)::float8));
      f_w := (f_tl - ((f_tl + f_e) - ((f_tl + f_e) - f_tl))) + (f_e - ((f_tl + f_e) - f_tl));
      k_r := f_s + (f_tl + f_e);
      if f_w <> 0 and ((f_s - (k_r - (k_r - f_s))) + ((f_tl + f_e) - (k_r - f_s))) <> 0 and (k_r + 2 * ((f_s - (k_r - (k_r - f_s))) + ((f_tl + f_e) - (k_r - f_s)))) - k_r = 2 * ((f_s - (k_r - (k_r - f_s))) + ((f_tl + f_e) - (k_r - f_s))) and (f_w < 0) = (((f_s - (k_r - (k_r - f_s))) + ((f_tl + f_e) - (k_r - f_s))) < 0) then k_r := k_r + 2 * ((f_s - (k_r - (k_r - f_s))) + ((f_tl + f_e) - (k_r - f_s))); end if;
    elsif k_w = 0 or k_r = 0 then
      k_r := k_w * k_r + (1.33333333333201242699e-01)::float8;
    else
      k_r := fdlibm_fma_wide(a => k_w, b => k_r, c => (1.33333333333201242699e-01)::float8);
    end if;
    if abs(k_w) >= 1e-144 and abs(k_w) <= 1e144 and abs((2.59073051863633712884e-05)::float8) >= 1e-144 and abs((2.59073051863633712884e-05)::float8) <= 1e144 and abs((7.14072491382608190305e-05)::float8) <= 1e288 then
      f_p := k_w * (2.59073051863633712884e-05)::float8;
      f_ah := (k_w * 134217729 - (k_w * 134217729 - k_w));
      f_e := (k_w - f_ah) * ((2.59073051863633712884e-05)::float8 - ((2.59073051863633712884e-05)::float8 * 134217729 - ((2.59073051863633712884e-05)::float8 * 134217729 - (2.59073051863633712884e-05)::float8))) - (((f_p - f_ah * ((2.59073051863633712884e-05)::float8 * 134217729 - ((2.59073051863633712884e-05)::float8 * 134217729 - (2.59073051863633712884e-05)::float8))) - (k_w - f_ah) * ((2.59073051863633712884e-05)::float8 * 134217729 - ((2.59073051863633712884e-05)::float8 * 134217729 - (2.59073051863633712884e-05)::float8))) - f_ah * ((2.59073051863633712884e-05)::float8 - ((2.59073051863633712884e-05)::float8 * 134217729 - ((2.59073051863633712884e-05)::float8 * 134217729 - (2.59073051863633712884e-05)::float8))));
      f_s := (7.14072491382608190305e-05)::float8 + f_p;
      f_tl := ((7.14072491382608190305e-05)::float8 - (f_s - (f_s - (7.14072491382608190305e-05)::float8))) + (f_p - (f_s - (7.14072491382608190305e-05)::float8));
      f_w := (f_tl - ((f_tl + f_e) - ((f_tl + f_e) - f_tl))) + (f_e - ((f_tl + f_e) - f_tl));
      k_v := f_s + (f_tl + f_e);
      if f_w <> 0 and ((f_s - (k_v - (k_v - f_s))) + ((f_tl + f_e) - (k_v - f_s))) <> 0 and (k_v + 2 * ((f_s - (k_v - (k_v - f_s))) + ((f_tl + f_e) - (k_v - f_s)))) - k_v = 2 * ((f_s - (k_v - (k_v - f_s))) + ((f_tl + f_e) - (k_v - f_s))) and (f_w < 0) = (((f_s - (k_v - (k_v - f_s))) + ((f_tl + f_e) - (k_v - f_s))) < 0) then k_v := k_v + 2 * ((f_s - (k_v - (k_v - f_s))) + ((f_tl + f_e) - (k_v - f_s))); end if;
    elsif k_w = 0 or (2.59073051863633712884e-05)::float8 = 0 then
      k_v := k_w * (2.59073051863633712884e-05)::float8 + (7.14072491382608190305e-05)::float8;
    else
      k_v := fdlibm_fma_wide(a => k_w, b => (2.59073051863633712884e-05)::float8, c => (7.14072491382608190305e-05)::float8);
    end if;
    if abs(k_w) >= 1e-144 and abs(k_w) <= 1e144 and abs(k_v) >= 1e-144 and abs(k_v) <= 1e144 and abs((2.46463134818469906812e-04)::float8) <= 1e288 then
      f_p := k_w * k_v;
      f_ah := (k_w * 134217729 - (k_w * 134217729 - k_w));
      f_bh := (k_v * 134217729 - (k_v * 134217729 - k_v));
      f_e := (k_w - f_ah) * (k_v - f_bh) - (((f_p - f_ah * f_bh) - (k_w - f_ah) * f_bh) - f_ah * (k_v - f_bh));
      f_s := (2.46463134818469906812e-04)::float8 + f_p;
      f_tl := ((2.46463134818469906812e-04)::float8 - (f_s - (f_s - (2.46463134818469906812e-04)::float8))) + (f_p - (f_s - (2.46463134818469906812e-04)::float8));
      f_w := (f_tl - ((f_tl + f_e) - ((f_tl + f_e) - f_tl))) + (f_e - ((f_tl + f_e) - f_tl));
      k_v := f_s + (f_tl + f_e);
      if f_w <> 0 and ((f_s - (k_v - (k_v - f_s))) + ((f_tl + f_e) - (k_v - f_s))) <> 0 and (k_v + 2 * ((f_s - (k_v - (k_v - f_s))) + ((f_tl + f_e) - (k_v - f_s)))) - k_v = 2 * ((f_s - (k_v - (k_v - f_s))) + ((f_tl + f_e) - (k_v - f_s))) and (f_w < 0) = (((f_s - (k_v - (k_v - f_s))) + ((f_tl + f_e) - (k_v - f_s))) < 0) then k_v := k_v + 2 * ((f_s - (k_v - (k_v - f_s))) + ((f_tl + f_e) - (k_v - f_s))); end if;
    elsif k_w = 0 or k_v = 0 then
      k_v := k_w * k_v + (2.46463134818469906812e-04)::float8;
    else
      k_v := fdlibm_fma_wide(a => k_w, b => k_v, c => (2.46463134818469906812e-04)::float8);
    end if;
    if abs(k_w) >= 1e-144 and abs(k_w) <= 1e144 and abs(k_v) >= 1e-144 and abs(k_v) <= 1e144 and abs((1.45620945432529025516e-03)::float8) <= 1e288 then
      f_p := k_w * k_v;
      f_ah := (k_w * 134217729 - (k_w * 134217729 - k_w));
      f_bh := (k_v * 134217729 - (k_v * 134217729 - k_v));
      f_e := (k_w - f_ah) * (k_v - f_bh) - (((f_p - f_ah * f_bh) - (k_w - f_ah) * f_bh) - f_ah * (k_v - f_bh));
      f_s := (1.45620945432529025516e-03)::float8 + f_p;
      f_tl := ((1.45620945432529025516e-03)::float8 - (f_s - (f_s - (1.45620945432529025516e-03)::float8))) + (f_p - (f_s - (1.45620945432529025516e-03)::float8));
      f_w := (f_tl - ((f_tl + f_e) - ((f_tl + f_e) - f_tl))) + (f_e - ((f_tl + f_e) - f_tl));
      k_v := f_s + (f_tl + f_e);
      if f_w <> 0 and ((f_s - (k_v - (k_v - f_s))) + ((f_tl + f_e) - (k_v - f_s))) <> 0 and (k_v + 2 * ((f_s - (k_v - (k_v - f_s))) + ((f_tl + f_e) - (k_v - f_s)))) - k_v = 2 * ((f_s - (k_v - (k_v - f_s))) + ((f_tl + f_e) - (k_v - f_s))) and (f_w < 0) = (((f_s - (k_v - (k_v - f_s))) + ((f_tl + f_e) - (k_v - f_s))) < 0) then k_v := k_v + 2 * ((f_s - (k_v - (k_v - f_s))) + ((f_tl + f_e) - (k_v - f_s))); end if;
    elsif k_w = 0 or k_v = 0 then
      k_v := k_w * k_v + (1.45620945432529025516e-03)::float8;
    else
      k_v := fdlibm_fma_wide(a => k_w, b => k_v, c => (1.45620945432529025516e-03)::float8);
    end if;
    if abs(k_w) >= 1e-144 and abs(k_w) <= 1e144 and abs(k_v) >= 1e-144 and abs(k_v) <= 1e144 and abs((8.86323982359930005737e-03)::float8) <= 1e288 then
      f_p := k_w * k_v;
      f_ah := (k_w * 134217729 - (k_w * 134217729 - k_w));
      f_bh := (k_v * 134217729 - (k_v * 134217729 - k_v));
      f_e := (k_w - f_ah) * (k_v - f_bh) - (((f_p - f_ah * f_bh) - (k_w - f_ah) * f_bh) - f_ah * (k_v - f_bh));
      f_s := (8.86323982359930005737e-03)::float8 + f_p;
      f_tl := ((8.86323982359930005737e-03)::float8 - (f_s - (f_s - (8.86323982359930005737e-03)::float8))) + (f_p - (f_s - (8.86323982359930005737e-03)::float8));
      f_w := (f_tl - ((f_tl + f_e) - ((f_tl + f_e) - f_tl))) + (f_e - ((f_tl + f_e) - f_tl));
      k_v := f_s + (f_tl + f_e);
      if f_w <> 0 and ((f_s - (k_v - (k_v - f_s))) + ((f_tl + f_e) - (k_v - f_s))) <> 0 and (k_v + 2 * ((f_s - (k_v - (k_v - f_s))) + ((f_tl + f_e) - (k_v - f_s)))) - k_v = 2 * ((f_s - (k_v - (k_v - f_s))) + ((f_tl + f_e) - (k_v - f_s))) and (f_w < 0) = (((f_s - (k_v - (k_v - f_s))) + ((f_tl + f_e) - (k_v - f_s))) < 0) then k_v := k_v + 2 * ((f_s - (k_v - (k_v - f_s))) + ((f_tl + f_e) - (k_v - f_s))); end if;
    elsif k_w = 0 or k_v = 0 then
      k_v := k_w * k_v + (8.86323982359930005737e-03)::float8;
    else
      k_v := fdlibm_fma_wide(a => k_w, b => k_v, c => (8.86323982359930005737e-03)::float8);
    end if;
    if abs(k_w) >= 1e-144 and abs(k_w) <= 1e144 and abs(k_v) >= 1e-144 and abs(k_v) <= 1e144 and abs((5.39682539762260521377e-02)::float8) <= 1e288 then
      f_p := k_w * k_v;
      f_ah := (k_w * 134217729 - (k_w * 134217729 - k_w));
      f_bh := (k_v * 134217729 - (k_v * 134217729 - k_v));
      f_e := (k_w - f_ah) * (k_v - f_bh) - (((f_p - f_ah * f_bh) - (k_w - f_ah) * f_bh) - f_ah * (k_v - f_bh));
      f_s := (5.39682539762260521377e-02)::float8 + f_p;
      f_tl := ((5.39682539762260521377e-02)::float8 - (f_s - (f_s - (5.39682539762260521377e-02)::float8))) + (f_p - (f_s - (5.39682539762260521377e-02)::float8));
      f_w := (f_tl - ((f_tl + f_e) - ((f_tl + f_e) - f_tl))) + (f_e - ((f_tl + f_e) - f_tl));
      k_v := f_s + (f_tl + f_e);
      if f_w <> 0 and ((f_s - (k_v - (k_v - f_s))) + ((f_tl + f_e) - (k_v - f_s))) <> 0 and (k_v + 2 * ((f_s - (k_v - (k_v - f_s))) + ((f_tl + f_e) - (k_v - f_s)))) - k_v = 2 * ((f_s - (k_v - (k_v - f_s))) + ((f_tl + f_e) - (k_v - f_s))) and (f_w < 0) = (((f_s - (k_v - (k_v - f_s))) + ((f_tl + f_e) - (k_v - f_s))) < 0) then k_v := k_v + 2 * ((f_s - (k_v - (k_v - f_s))) + ((f_tl + f_e) - (k_v - f_s))); end if;
    elsif k_w = 0 or k_v = 0 then
      k_v := k_w * k_v + (5.39682539762260521377e-02)::float8;
    else
      k_v := fdlibm_fma_wide(a => k_w, b => k_v, c => (5.39682539762260521377e-02)::float8);
    end if;
    k_v := k_z * k_v;
    k_s := k_z * k_x;
    f_b := k_r + k_v;
    if abs(k_s) >= 1e-144 and abs(k_s) <= 1e144 and abs(f_b) >= 1e-144 and abs(f_b) <= 1e144 and abs(k_y) <= 1e288 then
      f_p := k_s * f_b;
      f_ah := (k_s * 134217729 - (k_s * 134217729 - k_s));
      f_bh := (f_b * 134217729 - (f_b * 134217729 - f_b));
      f_e := (k_s - f_ah) * (f_b - f_bh) - (((f_p - f_ah * f_bh) - (k_s - f_ah) * f_bh) - f_ah * (f_b - f_bh));
      f_s := k_y + f_p;
      f_tl := (k_y - (f_s - (f_s - k_y))) + (f_p - (f_s - k_y));
      f_w := (f_tl - ((f_tl + f_e) - ((f_tl + f_e) - f_tl))) + (f_e - ((f_tl + f_e) - f_tl));
      k_u := f_s + (f_tl + f_e);
      if f_w <> 0 and ((f_s - (k_u - (k_u - f_s))) + ((f_tl + f_e) - (k_u - f_s))) <> 0 and (k_u + 2 * ((f_s - (k_u - (k_u - f_s))) + ((f_tl + f_e) - (k_u - f_s)))) - k_u = 2 * ((f_s - (k_u - (k_u - f_s))) + ((f_tl + f_e) - (k_u - f_s))) and (f_w < 0) = (((f_s - (k_u - (k_u - f_s))) + ((f_tl + f_e) - (k_u - f_s))) < 0) then k_u := k_u + 2 * ((f_s - (k_u - (k_u - f_s))) + ((f_tl + f_e) - (k_u - f_s))); end if;
    elsif k_s = 0 or f_b = 0 then
      k_u := k_s * f_b + k_y;
    else
      k_u := fdlibm_fma_wide(a => k_s, b => f_b, c => k_y);
    end if;
    if abs(k_z) >= 1e-144 and abs(k_z) <= 1e144 and abs(k_u) >= 1e-144 and abs(k_u) <= 1e144 and abs(k_y) <= 1e288 then
      f_p := k_z * k_u;
      f_ah := (k_z * 134217729 - (k_z * 134217729 - k_z));
      f_bh := (k_u * 134217729 - (k_u * 134217729 - k_u));
      f_e := (k_z - f_ah) * (k_u - f_bh) - (((f_p - f_ah * f_bh) - (k_z - f_ah) * f_bh) - f_ah * (k_u - f_bh));
      f_s := k_y + f_p;
      f_tl := (k_y - (f_s - (f_s - k_y))) + (f_p - (f_s - k_y));
      f_w := (f_tl - ((f_tl + f_e) - ((f_tl + f_e) - f_tl))) + (f_e - ((f_tl + f_e) - f_tl));
      k_r := f_s + (f_tl + f_e);
      if f_w <> 0 and ((f_s - (k_r - (k_r - f_s))) + ((f_tl + f_e) - (k_r - f_s))) <> 0 and (k_r + 2 * ((f_s - (k_r - (k_r - f_s))) + ((f_tl + f_e) - (k_r - f_s)))) - k_r = 2 * ((f_s - (k_r - (k_r - f_s))) + ((f_tl + f_e) - (k_r - f_s))) and (f_w < 0) = (((f_s - (k_r - (k_r - f_s))) + ((f_tl + f_e) - (k_r - f_s))) < 0) then k_r := k_r + 2 * ((f_s - (k_r - (k_r - f_s))) + ((f_tl + f_e) - (k_r - f_s))); end if;
    elsif k_z = 0 or k_u = 0 then
      k_r := k_z * k_u + k_y;
    else
      k_r := fdlibm_fma_wide(a => k_z, b => k_u, c => k_y);
    end if;
    if abs((3.33333333333334091986e-01)::float8) >= 1e-144 and abs((3.33333333333334091986e-01)::float8) <= 1e144 and abs(k_s) >= 1e-144 and abs(k_s) <= 1e144 and abs(k_r) <= 1e288 then
      f_p := (3.33333333333334091986e-01)::float8 * k_s;
      f_bh := (k_s * 134217729 - (k_s * 134217729 - k_s));
      f_e := ((3.33333333333334091986e-01)::float8 - ((3.33333333333334091986e-01)::float8 * 134217729 - ((3.33333333333334091986e-01)::float8 * 134217729 - (3.33333333333334091986e-01)::float8))) * (k_s - f_bh) - (((f_p - ((3.33333333333334091986e-01)::float8 * 134217729 - ((3.33333333333334091986e-01)::float8 * 134217729 - (3.33333333333334091986e-01)::float8)) * f_bh) - ((3.33333333333334091986e-01)::float8 - ((3.33333333333334091986e-01)::float8 * 134217729 - ((3.33333333333334091986e-01)::float8 * 134217729 - (3.33333333333334091986e-01)::float8))) * f_bh) - ((3.33333333333334091986e-01)::float8 * 134217729 - ((3.33333333333334091986e-01)::float8 * 134217729 - (3.33333333333334091986e-01)::float8)) * (k_s - f_bh));
      f_s := k_r + f_p;
      f_tl := (k_r - (f_s - (f_s - k_r))) + (f_p - (f_s - k_r));
      f_w := (f_tl - ((f_tl + f_e) - ((f_tl + f_e) - f_tl))) + (f_e - ((f_tl + f_e) - f_tl));
      k_r := f_s + (f_tl + f_e);
      if f_w <> 0 and ((f_s - (k_r - (k_r - f_s))) + ((f_tl + f_e) - (k_r - f_s))) <> 0 and (k_r + 2 * ((f_s - (k_r - (k_r - f_s))) + ((f_tl + f_e) - (k_r - f_s)))) - k_r = 2 * ((f_s - (k_r - (k_r - f_s))) + ((f_tl + f_e) - (k_r - f_s))) and (f_w < 0) = (((f_s - (k_r - (k_r - f_s))) + ((f_tl + f_e) - (k_r - f_s))) < 0) then k_r := k_r + 2 * ((f_s - (k_r - (k_r - f_s))) + ((f_tl + f_e) - (k_r - f_s))); end if;
    elsif (3.33333333333334091986e-01)::float8 = 0 or k_s = 0 then
      k_r := (3.33333333333334091986e-01)::float8 * k_s + k_r;
    else
      k_r := fdlibm_fma_wide(a => (3.33333333333334091986e-01)::float8, b => k_s, c => k_r);
    end if;
    k_w := k_x + k_r;
    if k_ix >= 0x3FE59428 then
      k_v := iy;
      res := (1 - ((k_hx >> 30) & 2)) * (k_v - 2 * (k_x - (k_w * k_w / (k_w + k_v) - k_r)));
    elsif iy = 1 then
      res := k_w;
    else
      k_z := (trunc((k_w) * (('{2.2250738585072014e-308,4.1045368012983762e-289,7.571533991467358e-270,1.3967014978599092e-250,2.5764595078388533e-231,4.7527289157379e-212,8.767237396033612e-193,1.617269844780878e-173,2.983336292480083e-154,5.503284107318959e-135,1.0151767349262597e-115,1.8726705418768793e-96,3.454467422037778e-77,6.372367644529809e-58,1.1754943508222875e-38,2.168404344971009e-19,4,73786976294838210000,1.361129467683754e+39,2.5108406941546723e+58,4.631683569492648e+77,8.54394814368364e+96,1.5760802478557792e+116,2.9073548971824276e+135,5.363123171977039e+154,9.893216058924181e+173,1.824976247048878e+193,3.366486976990959e+212,6.210072369202836e+231,1.1455561567389984e+251,2.113178124542661e+270,3.89812560456e+289}'::float8[])[(((1043 - ((((int8(float8send(k_w)) >> 32)::int) >> 20) & 2047)) + 1022) >> 6) + 1] * ('{1,2,4,8,16,32,64,128,256,512,1024,2048,4096,8192,16384,32768,65536,131072,262144,524288,1048576,2097152,4194304,8388608,16777216,33554432,67108864,134217728,268435456,536870912,1073741824,2147483648,4294967296,8589934592,17179869184,34359738368,68719476736,137438953472,274877906944,549755813888,1099511627776,2199023255552,4398046511104,8796093022208,17592186044416,35184372088832,70368744177664,140737488355328,281474976710656,562949953421312,1125899906842624,2251799813685248,4503599627370496,9007199254740992,18014398509481984,36028797018963970,72057594037927940,144115188075855870,288230376151711740,576460752303423500,1152921504606847000,2305843009213694000,4611686018427388000,9223372036854776000}'::float8[])[(((1043 - ((((int8(float8send(k_w)) >> 32)::int) >> 20) & 2047)) + 1022) & 63) + 1])) * (('{2.2250738585072014e-308,4.1045368012983762e-289,7.571533991467358e-270,1.3967014978599092e-250,2.5764595078388533e-231,4.7527289157379e-212,8.767237396033612e-193,1.617269844780878e-173,2.983336292480083e-154,5.503284107318959e-135,1.0151767349262597e-115,1.8726705418768793e-96,3.454467422037778e-77,6.372367644529809e-58,1.1754943508222875e-38,2.168404344971009e-19,4,73786976294838210000,1.361129467683754e+39,2.5108406941546723e+58,4.631683569492648e+77,8.54394814368364e+96,1.5760802478557792e+116,2.9073548971824276e+135,5.363123171977039e+154,9.893216058924181e+173,1.824976247048878e+193,3.366486976990959e+212,6.210072369202836e+231,1.1455561567389984e+251,2.113178124542661e+270,3.89812560456e+289}'::float8[])[(((((((int8(float8send(k_w)) >> 32)::int) >> 20) & 2047) - 1043) + 1022) >> 6) + 1] * ('{1,2,4,8,16,32,64,128,256,512,1024,2048,4096,8192,16384,32768,65536,131072,262144,524288,1048576,2097152,4194304,8388608,16777216,33554432,67108864,134217728,268435456,536870912,1073741824,2147483648,4294967296,8589934592,17179869184,34359738368,68719476736,137438953472,274877906944,549755813888,1099511627776,2199023255552,4398046511104,8796093022208,17592186044416,35184372088832,70368744177664,140737488355328,281474976710656,562949953421312,1125899906842624,2251799813685248,4503599627370496,9007199254740992,18014398509481984,36028797018963970,72057594037927940,144115188075855870,288230376151711740,576460752303423500,1152921504606847000,2305843009213694000,4611686018427388000,9223372036854776000}'::float8[])[(((((((int8(float8send(k_w)) >> 32)::int) >> 20) & 2047) - 1043) + 1022) & 63) + 1]));
      k_v := k_r - (k_z - k_x);
      k_a := -1 / k_w;
      k_t := (trunc((k_a) * (('{2.2250738585072014e-308,4.1045368012983762e-289,7.571533991467358e-270,1.3967014978599092e-250,2.5764595078388533e-231,4.7527289157379e-212,8.767237396033612e-193,1.617269844780878e-173,2.983336292480083e-154,5.503284107318959e-135,1.0151767349262597e-115,1.8726705418768793e-96,3.454467422037778e-77,6.372367644529809e-58,1.1754943508222875e-38,2.168404344971009e-19,4,73786976294838210000,1.361129467683754e+39,2.5108406941546723e+58,4.631683569492648e+77,8.54394814368364e+96,1.5760802478557792e+116,2.9073548971824276e+135,5.363123171977039e+154,9.893216058924181e+173,1.824976247048878e+193,3.366486976990959e+212,6.210072369202836e+231,1.1455561567389984e+251,2.113178124542661e+270,3.89812560456e+289}'::float8[])[(((1043 - ((((int8(float8send(k_a)) >> 32)::int) >> 20) & 2047)) + 1022) >> 6) + 1] * ('{1,2,4,8,16,32,64,128,256,512,1024,2048,4096,8192,16384,32768,65536,131072,262144,524288,1048576,2097152,4194304,8388608,16777216,33554432,67108864,134217728,268435456,536870912,1073741824,2147483648,4294967296,8589934592,17179869184,34359738368,68719476736,137438953472,274877906944,549755813888,1099511627776,2199023255552,4398046511104,8796093022208,17592186044416,35184372088832,70368744177664,140737488355328,281474976710656,562949953421312,1125899906842624,2251799813685248,4503599627370496,9007199254740992,18014398509481984,36028797018963970,72057594037927940,144115188075855870,288230376151711740,576460752303423500,1152921504606847000,2305843009213694000,4611686018427388000,9223372036854776000}'::float8[])[(((1043 - ((((int8(float8send(k_a)) >> 32)::int) >> 20) & 2047)) + 1022) & 63) + 1])) * (('{2.2250738585072014e-308,4.1045368012983762e-289,7.571533991467358e-270,1.3967014978599092e-250,2.5764595078388533e-231,4.7527289157379e-212,8.767237396033612e-193,1.617269844780878e-173,2.983336292480083e-154,5.503284107318959e-135,1.0151767349262597e-115,1.8726705418768793e-96,3.454467422037778e-77,6.372367644529809e-58,1.1754943508222875e-38,2.168404344971009e-19,4,73786976294838210000,1.361129467683754e+39,2.5108406941546723e+58,4.631683569492648e+77,8.54394814368364e+96,1.5760802478557792e+116,2.9073548971824276e+135,5.363123171977039e+154,9.893216058924181e+173,1.824976247048878e+193,3.366486976990959e+212,6.210072369202836e+231,1.1455561567389984e+251,2.113178124542661e+270,3.89812560456e+289}'::float8[])[(((((((int8(float8send(k_a)) >> 32)::int) >> 20) & 2047) - 1043) + 1022) >> 6) + 1] * ('{1,2,4,8,16,32,64,128,256,512,1024,2048,4096,8192,16384,32768,65536,131072,262144,524288,1048576,2097152,4194304,8388608,16777216,33554432,67108864,134217728,268435456,536870912,1073741824,2147483648,4294967296,8589934592,17179869184,34359738368,68719476736,137438953472,274877906944,549755813888,1099511627776,2199023255552,4398046511104,8796093022208,17592186044416,35184372088832,70368744177664,140737488355328,281474976710656,562949953421312,1125899906842624,2251799813685248,4503599627370496,9007199254740992,18014398509481984,36028797018963970,72057594037927940,144115188075855870,288230376151711740,576460752303423500,1152921504606847000,2305843009213694000,4611686018427388000,9223372036854776000}'::float8[])[(((((((int8(float8send(k_a)) >> 32)::int) >> 20) & 2047) - 1043) + 1022) & 63) + 1]));
      if abs(k_t) >= 1e-144 and abs(k_t) <= 1e144 and abs(k_z) >= 1e-144 and abs(k_z) <= 1e144 and abs((1)::float8) <= 1e288 then
        f_p := k_t * k_z;
        f_ah := (k_t * 134217729 - (k_t * 134217729 - k_t));
        f_bh := (k_z * 134217729 - (k_z * 134217729 - k_z));
        f_e := (k_t - f_ah) * (k_z - f_bh) - (((f_p - f_ah * f_bh) - (k_t - f_ah) * f_bh) - f_ah * (k_z - f_bh));
        f_s := (1)::float8 + f_p;
        f_tl := ((1)::float8 - (f_s - (f_s - (1)::float8))) + (f_p - (f_s - (1)::float8));
        f_w := (f_tl - ((f_tl + f_e) - ((f_tl + f_e) - f_tl))) + (f_e - ((f_tl + f_e) - f_tl));
        k_s := f_s + (f_tl + f_e);
        if f_w <> 0 and ((f_s - (k_s - (k_s - f_s))) + ((f_tl + f_e) - (k_s - f_s))) <> 0 and (k_s + 2 * ((f_s - (k_s - (k_s - f_s))) + ((f_tl + f_e) - (k_s - f_s)))) - k_s = 2 * ((f_s - (k_s - (k_s - f_s))) + ((f_tl + f_e) - (k_s - f_s))) and (f_w < 0) = (((f_s - (k_s - (k_s - f_s))) + ((f_tl + f_e) - (k_s - f_s))) < 0) then k_s := k_s + 2 * ((f_s - (k_s - (k_s - f_s))) + ((f_tl + f_e) - (k_s - f_s))); end if;
      elsif k_t = 0 or k_z = 0 then
        k_s := k_t * k_z + (1)::float8;
      else
        k_s := fdlibm_fma_wide(a => k_t, b => k_z, c => (1)::float8);
      end if;
      if abs(k_t) >= 1e-144 and abs(k_t) <= 1e144 and abs(k_v) >= 1e-144 and abs(k_v) <= 1e144 and abs(k_s) <= 1e288 then
        f_p := k_t * k_v;
        f_ah := (k_t * 134217729 - (k_t * 134217729 - k_t));
        f_bh := (k_v * 134217729 - (k_v * 134217729 - k_v));
        f_e := (k_t - f_ah) * (k_v - f_bh) - (((f_p - f_ah * f_bh) - (k_t - f_ah) * f_bh) - f_ah * (k_v - f_bh));
        f_s := k_s + f_p;
        f_tl := (k_s - (f_s - (f_s - k_s))) + (f_p - (f_s - k_s));
        f_w := (f_tl - ((f_tl + f_e) - ((f_tl + f_e) - f_tl))) + (f_e - ((f_tl + f_e) - f_tl));
        k_u := f_s + (f_tl + f_e);
        if f_w <> 0 and ((f_s - (k_u - (k_u - f_s))) + ((f_tl + f_e) - (k_u - f_s))) <> 0 and (k_u + 2 * ((f_s - (k_u - (k_u - f_s))) + ((f_tl + f_e) - (k_u - f_s)))) - k_u = 2 * ((f_s - (k_u - (k_u - f_s))) + ((f_tl + f_e) - (k_u - f_s))) and (f_w < 0) = (((f_s - (k_u - (k_u - f_s))) + ((f_tl + f_e) - (k_u - f_s))) < 0) then k_u := k_u + 2 * ((f_s - (k_u - (k_u - f_s))) + ((f_tl + f_e) - (k_u - f_s))); end if;
      elsif k_t = 0 or k_v = 0 then
        k_u := k_t * k_v + k_s;
      else
        k_u := fdlibm_fma_wide(a => k_t, b => k_v, c => k_s);
      end if;
      if abs(k_a) >= 1e-144 and abs(k_a) <= 1e144 and abs(k_u) >= 1e-144 and abs(k_u) <= 1e144 and abs(k_t) <= 1e288 then
        f_p := k_a * k_u;
        f_ah := (k_a * 134217729 - (k_a * 134217729 - k_a));
        f_bh := (k_u * 134217729 - (k_u * 134217729 - k_u));
        f_e := (k_a - f_ah) * (k_u - f_bh) - (((f_p - f_ah * f_bh) - (k_a - f_ah) * f_bh) - f_ah * (k_u - f_bh));
        f_s := k_t + f_p;
        f_tl := (k_t - (f_s - (f_s - k_t))) + (f_p - (f_s - k_t));
        f_w := (f_tl - ((f_tl + f_e) - ((f_tl + f_e) - f_tl))) + (f_e - ((f_tl + f_e) - f_tl));
        res := f_s + (f_tl + f_e);
        if f_w <> 0 and ((f_s - (res - (res - f_s))) + ((f_tl + f_e) - (res - f_s))) <> 0 and (res + 2 * ((f_s - (res - (res - f_s))) + ((f_tl + f_e) - (res - f_s)))) - res = 2 * ((f_s - (res - (res - f_s))) + ((f_tl + f_e) - (res - f_s))) and (f_w < 0) = (((f_s - (res - (res - f_s))) + ((f_tl + f_e) - (res - f_s))) < 0) then res := res + 2 * ((f_s - (res - (res - f_s))) + ((f_tl + f_e) - (res - f_s))); end if;
      elsif k_a = 0 or k_u = 0 then
        res := k_a * k_u + k_t;
      else
        res := fdlibm_fma_wide(a => k_a, b => k_u, c => k_t);
      end if;
    end if;
  end if;

  return res;
end $$;

-- V8's sin, cos and tan (op 0, 1, 2) for |x| above 2^19·π/2: __ieee754_rem_pio2's large case and __kernel_rem_pio2
-- (prec 2), then the kernel of n mod 4. Its contracted products (24-bit chunks of x, 2/π and π/2, and 2^24 × fw) are
-- exact, so their fused and unfused forms agree.
create function p3.fdlibm_trig_large(op int, x float8) returns float8 language plpgsql immutable as $$
declare
  hx int := (int8(float8send(x)) >> 32)::int; ix int := hx & 2147483647;
  e0 int; z float8; nx int := 3; jk int := 4; jp int := 4; jx int; jv int; jz int; q0 int; carry int; n int; ih int;
  i int; j int; k int; m int; fw float8; y0 float8; y1 float8; u float8;
  tx float8[] := array_fill(0::float8, array[3], array[0]);
  f float8[] := array_fill(0::float8, array[20], array[0]);
  fq float8[] := array_fill(0::float8, array[20], array[0]);
  q float8[] := array_fill(0::float8, array[20], array[0]);
  iq int[] := array_fill(0, array[20], array[0]);
begin
  e0 := (ix >> 20) - 1046;
  z := abs(x) * (('{2.2250738585072014e-308,4.1045368012983762e-289,7.571533991467358e-270,1.3967014978599092e-250,2.5764595078388533e-231,4.7527289157379e-212,8.767237396033612e-193,1.617269844780878e-173,2.983336292480083e-154,5.503284107318959e-135,1.0151767349262597e-115,1.8726705418768793e-96,3.454467422037778e-77,6.372367644529809e-58,1.1754943508222875e-38,2.168404344971009e-19,4,73786976294838210000,1.361129467683754e+39,2.5108406941546723e+58,4.631683569492648e+77,8.54394814368364e+96,1.5760802478557792e+116,2.9073548971824276e+135,5.363123171977039e+154,9.893216058924181e+173,1.824976247048878e+193,3.366486976990959e+212,6.210072369202836e+231,1.1455561567389984e+251,2.113178124542661e+270,3.89812560456e+289}'::float8[])[(((-e0) + 1022) >> 6) + 1] * ('{1,2,4,8,16,32,64,128,256,512,1024,2048,4096,8192,16384,32768,65536,131072,262144,524288,1048576,2097152,4194304,8388608,16777216,33554432,67108864,134217728,268435456,536870912,1073741824,2147483648,4294967296,8589934592,17179869184,34359738368,68719476736,137438953472,274877906944,549755813888,1099511627776,2199023255552,4398046511104,8796093022208,17592186044416,35184372088832,70368744177664,140737488355328,281474976710656,562949953421312,1125899906842624,2251799813685248,4503599627370496,9007199254740992,18014398509481984,36028797018963970,72057594037927940,144115188075855870,288230376151711740,576460752303423500,1152921504606847000,2305843009213694000,4611686018427388000,9223372036854776000}'::float8[])[(((-e0) + 1022) & 63) + 1]);
  tx[0] := trunc(z); z := (z - tx[0]) * 16777216;
  tx[1] := trunc(z); z := (z - tx[1]) * 16777216;
  tx[2] := z;
  while tx[nx - 1] = 0 loop nx := nx - 1; end loop;
  jx := nx - 1;
  jv := (e0 - 3) / 24;
  if jv < 0 then jv := 0; end if;
  q0 := e0 - 24 * (jv + 1);
  j := jv - jx;
  m := jx + jk;
  for i in 0..m loop
    f[i] := case when j < 0 then 0 else ('{10680707,7228996,1387004,2578385,16069853,12639074,9804092,4427841,16666979,11263675,12935607,2387514,4345298,14681673,3074569,13734428,16653803,1880361,10960616,8533493,3062596,8710556,7349940,6258241,3772886,3769171,3798172,8675211,12450088,3874808,9961438,366607,15675153,9132554,7151469,3571407,2607881,12013382,4155038,6285869,7677882,13102053,15825725,473591,9065106,15363067,6271263,9264392,5636912,4652155,7056368,13614112,10155062,1944035,9527646,15080200,6658437,6231200,6832269,16767104,5075751,3212806,1398474,7579849,6349435,12618859}'::int[])[j + 1] end;
    j := j + 1;
  end loop;
  for i in 0..jk loop
    fw := 0;
    for j in 0..jx loop fw := fw + tx[j] * f[jx + i - j]; end loop;
    q[i] := fw;
  end loop;
  jz := jk;
  loop
    i := 0;
    j := jz;
    z := q[jz];
    while j > 0 loop
      fw := trunc(5.96046447753906250000e-08 * z);
      iq[i] := trunc(z - 16777216 * fw)::int;
      z := q[j - 1] + fw;
      i := i + 1;
      j := j - 1;
    end loop;
    z := z * (('{2.2250738585072014e-308,4.1045368012983762e-289,7.571533991467358e-270,1.3967014978599092e-250,2.5764595078388533e-231,4.7527289157379e-212,8.767237396033612e-193,1.617269844780878e-173,2.983336292480083e-154,5.503284107318959e-135,1.0151767349262597e-115,1.8726705418768793e-96,3.454467422037778e-77,6.372367644529809e-58,1.1754943508222875e-38,2.168404344971009e-19,4,73786976294838210000,1.361129467683754e+39,2.5108406941546723e+58,4.631683569492648e+77,8.54394814368364e+96,1.5760802478557792e+116,2.9073548971824276e+135,5.363123171977039e+154,9.893216058924181e+173,1.824976247048878e+193,3.366486976990959e+212,6.210072369202836e+231,1.1455561567389984e+251,2.113178124542661e+270,3.89812560456e+289}'::float8[])[(((q0) + 1022) >> 6) + 1] * ('{1,2,4,8,16,32,64,128,256,512,1024,2048,4096,8192,16384,32768,65536,131072,262144,524288,1048576,2097152,4194304,8388608,16777216,33554432,67108864,134217728,268435456,536870912,1073741824,2147483648,4294967296,8589934592,17179869184,34359738368,68719476736,137438953472,274877906944,549755813888,1099511627776,2199023255552,4398046511104,8796093022208,17592186044416,35184372088832,70368744177664,140737488355328,281474976710656,562949953421312,1125899906842624,2251799813685248,4503599627370496,9007199254740992,18014398509481984,36028797018963970,72057594037927940,144115188075855870,288230376151711740,576460752303423500,1152921504606847000,2305843009213694000,4611686018427388000,9223372036854776000}'::float8[])[(((q0) + 1022) & 63) + 1]);
    z := z - 8 * floor(z * 0.125);
    n := trunc(z)::int;
    z := z - n;
    ih := 0;
    if q0 > 0 then
      i := iq[jz - 1] >> (24 - q0);
      n := n + i;
      iq[jz - 1] := iq[jz - 1] - (i << (24 - q0));
      ih := iq[jz - 1] >> (23 - q0);
    elsif q0 = 0 then
      ih := iq[jz - 1] >> 23;
    elsif z >= 0.5 then
      ih := 2;
    end if;
    if ih > 0 then
      n := n + 1;
      carry := 0;
      for i in 0..jz - 1 loop
        j := iq[i];
        if carry = 0 then
          if j <> 0 then carry := 1; iq[i] := 16777216 - j; end if;
        else
          iq[i] := 16777215 - j;
        end if;
      end loop;
      if q0 = 1 then iq[jz - 1] := iq[jz - 1] & 8388607;
      elsif q0 = 2 then iq[jz - 1] := iq[jz - 1] & 4194303;
      end if;
      if ih = 2 then
        z := 1 - z;
        if carry <> 0 then z := z - (('{2.2250738585072014e-308,4.1045368012983762e-289,7.571533991467358e-270,1.3967014978599092e-250,2.5764595078388533e-231,4.7527289157379e-212,8.767237396033612e-193,1.617269844780878e-173,2.983336292480083e-154,5.503284107318959e-135,1.0151767349262597e-115,1.8726705418768793e-96,3.454467422037778e-77,6.372367644529809e-58,1.1754943508222875e-38,2.168404344971009e-19,4,73786976294838210000,1.361129467683754e+39,2.5108406941546723e+58,4.631683569492648e+77,8.54394814368364e+96,1.5760802478557792e+116,2.9073548971824276e+135,5.363123171977039e+154,9.893216058924181e+173,1.824976247048878e+193,3.366486976990959e+212,6.210072369202836e+231,1.1455561567389984e+251,2.113178124542661e+270,3.89812560456e+289}'::float8[])[(((q0) + 1022) >> 6) + 1] * ('{1,2,4,8,16,32,64,128,256,512,1024,2048,4096,8192,16384,32768,65536,131072,262144,524288,1048576,2097152,4194304,8388608,16777216,33554432,67108864,134217728,268435456,536870912,1073741824,2147483648,4294967296,8589934592,17179869184,34359738368,68719476736,137438953472,274877906944,549755813888,1099511627776,2199023255552,4398046511104,8796093022208,17592186044416,35184372088832,70368744177664,140737488355328,281474976710656,562949953421312,1125899906842624,2251799813685248,4503599627370496,9007199254740992,18014398509481984,36028797018963970,72057594037927940,144115188075855870,288230376151711740,576460752303423500,1152921504606847000,2305843009213694000,4611686018427388000,9223372036854776000}'::float8[])[(((q0) + 1022) & 63) + 1]); end if;
      end if;
    end if;
    exit when z <> 0;
    j := 0;
    for i in reverse jz - 1..jk loop j := j | iq[i]; end loop;
    exit when j <> 0;
    k := 1;
    while case when k <= jk then iq[jk - k] = 0 else false end loop k := k + 1; end loop;
    for i in jz + 1..jz + k loop
      f[jx + i] := ('{10680707,7228996,1387004,2578385,16069853,12639074,9804092,4427841,16666979,11263675,12935607,2387514,4345298,14681673,3074569,13734428,16653803,1880361,10960616,8533493,3062596,8710556,7349940,6258241,3772886,3769171,3798172,8675211,12450088,3874808,9961438,366607,15675153,9132554,7151469,3571407,2607881,12013382,4155038,6285869,7677882,13102053,15825725,473591,9065106,15363067,6271263,9264392,5636912,4652155,7056368,13614112,10155062,1944035,9527646,15080200,6658437,6231200,6832269,16767104,5075751,3212806,1398474,7579849,6349435,12618859}'::int[])[jv + i + 1];
      fw := 0;
      for j in 0..jx loop fw := fw + tx[j] * f[jx + i - j]; end loop;
      q[i] := fw;
    end loop;
    jz := jz + k;
  end loop;
  if z = 0 then
    jz := jz - 1;
    q0 := q0 - 24;
    while iq[jz] = 0 loop jz := jz - 1; q0 := q0 - 24; end loop;
  else
    z := z * (('{2.2250738585072014e-308,4.1045368012983762e-289,7.571533991467358e-270,1.3967014978599092e-250,2.5764595078388533e-231,4.7527289157379e-212,8.767237396033612e-193,1.617269844780878e-173,2.983336292480083e-154,5.503284107318959e-135,1.0151767349262597e-115,1.8726705418768793e-96,3.454467422037778e-77,6.372367644529809e-58,1.1754943508222875e-38,2.168404344971009e-19,4,73786976294838210000,1.361129467683754e+39,2.5108406941546723e+58,4.631683569492648e+77,8.54394814368364e+96,1.5760802478557792e+116,2.9073548971824276e+135,5.363123171977039e+154,9.893216058924181e+173,1.824976247048878e+193,3.366486976990959e+212,6.210072369202836e+231,1.1455561567389984e+251,2.113178124542661e+270,3.89812560456e+289}'::float8[])[(((-q0) + 1022) >> 6) + 1] * ('{1,2,4,8,16,32,64,128,256,512,1024,2048,4096,8192,16384,32768,65536,131072,262144,524288,1048576,2097152,4194304,8388608,16777216,33554432,67108864,134217728,268435456,536870912,1073741824,2147483648,4294967296,8589934592,17179869184,34359738368,68719476736,137438953472,274877906944,549755813888,1099511627776,2199023255552,4398046511104,8796093022208,17592186044416,35184372088832,70368744177664,140737488355328,281474976710656,562949953421312,1125899906842624,2251799813685248,4503599627370496,9007199254740992,18014398509481984,36028797018963970,72057594037927940,144115188075855870,288230376151711740,576460752303423500,1152921504606847000,2305843009213694000,4611686018427388000,9223372036854776000}'::float8[])[(((-q0) + 1022) & 63) + 1]);
    if z >= 16777216 then
      fw := trunc(5.96046447753906250000e-08 * z);
      iq[jz] := trunc(z - 16777216 * fw)::int;
      jz := jz + 1;
      q0 := q0 + 24;
      iq[jz] := fw::int;
    else
      iq[jz] := trunc(z)::int;
    end if;
  end if;
  fw := (('{2.2250738585072014e-308,4.1045368012983762e-289,7.571533991467358e-270,1.3967014978599092e-250,2.5764595078388533e-231,4.7527289157379e-212,8.767237396033612e-193,1.617269844780878e-173,2.983336292480083e-154,5.503284107318959e-135,1.0151767349262597e-115,1.8726705418768793e-96,3.454467422037778e-77,6.372367644529809e-58,1.1754943508222875e-38,2.168404344971009e-19,4,73786976294838210000,1.361129467683754e+39,2.5108406941546723e+58,4.631683569492648e+77,8.54394814368364e+96,1.5760802478557792e+116,2.9073548971824276e+135,5.363123171977039e+154,9.893216058924181e+173,1.824976247048878e+193,3.366486976990959e+212,6.210072369202836e+231,1.1455561567389984e+251,2.113178124542661e+270,3.89812560456e+289}'::float8[])[(((q0) + 1022) >> 6) + 1] * ('{1,2,4,8,16,32,64,128,256,512,1024,2048,4096,8192,16384,32768,65536,131072,262144,524288,1048576,2097152,4194304,8388608,16777216,33554432,67108864,134217728,268435456,536870912,1073741824,2147483648,4294967296,8589934592,17179869184,34359738368,68719476736,137438953472,274877906944,549755813888,1099511627776,2199023255552,4398046511104,8796093022208,17592186044416,35184372088832,70368744177664,140737488355328,281474976710656,562949953421312,1125899906842624,2251799813685248,4503599627370496,9007199254740992,18014398509481984,36028797018963970,72057594037927940,144115188075855870,288230376151711740,576460752303423500,1152921504606847000,2305843009213694000,4611686018427388000,9223372036854776000}'::float8[])[(((q0) + 1022) & 63) + 1]);
  for i in reverse jz..0 loop
    q[i] := fw * iq[i];
    fw := fw * 5.96046447753906250000e-08;
  end loop;
  for i in reverse jz..0 loop
    fw := 0;
    k := 0;
    while k <= jp and k <= jz - i loop fw := fw + ('{1.570796251296997,7.549789415861596e-8,5.390302529957765e-15,3.282003415807913e-22,1.270655753080676e-29,1.2293330898111133e-36,2.7337005381646456e-44,2.1674168387780482e-51}'::float8[])[k + 1] * q[i + k]; k := k + 1; end loop;
    fq[jz - i] := fw;
  end loop;
  fw := 0;
  for i in reverse jz..0 loop fw := fw + fq[i]; end loop;
  y0 := case when ih = 0 then fw else -fw end;
  fw := fq[0] - fw;
  for i in 1..jz loop fw := fw + fq[i]; end loop;
  y1 := case when ih = 0 then fw else -fw end;
  n := n & 7;
  if hx < 0 then n := -n; y0 := -y0; y1 := -y1; end if;
  return (case when op = 2 then fdlibm_kernel_tan(x => y0, y => y1, iy => 1 - ((n & 1) << 1))
    when (n & 3) = case when op = 0 then 0 else 3 end then fdlibm_kernel_sin(x => y0, y => y1, iy => 1)
    when (n & 3) = case when op = 0 then 1 else 0 end then fdlibm_kernel_cos(x => y0, y => y1)
    when (n & 3) = case when op = 0 then 2 else 1 end then -fdlibm_kernel_sin(x => y0, y => y1, iy => 1)
    else -fdlibm_kernel_cos(x => y0, y => y1) end)
;
end $$;
-- V8's sin (ieee754.cc; Math.sin), with __ieee754_rem_pio2's reduction up to 2^19·π/2 and the kernels
-- inline. fn × pio2_1 is exact (20 by 31 bits), so its fused and unfused forms agree.
create function p3.fdlibm_sin(x float8) returns float8 language plpgsql immutable as $$
declare f_a float8; f_b float8; f_c float8; f_p float8; f_ah float8; f_bh float8; f_e float8; f_s float8; f_tl float8; f_w float8; k_ix int; k_hx int; k_x float8; k_y float8; k_z float8; k_v float8; k_r float8; k_u float8; k_q float8; k_w float8; k_a float8; k_t float8; k_s float8;
 hx int := (int8(float8send(x)) >> 32)::int; ix int := hx & 2147483647; z float8; w float8; t float8; r float8; fn float8; y0 float8; y1 float8; n int; j int; i int; u float8; res float8; kiy int;
begin
  if ix <= 0x3FE921FB then
    n := 0; y0 := x; y1 := 0; kiy := case when 0 = 0 then 0 else 1 end;
  elsif ix >= 0x7FF00000 then
    return case when x = 'NaN' then x else 'NaN'::float8 end;
  elsif ix < 0x4002D97C then
    if hx > 0 then
      z := x - 1.57079632673412561417e+00;
      if ix <> 0x3FF921FB then
        y0 := z - 6.07710050650619224932e-11;
        y1 := (z - y0) - 6.07710050650619224932e-11;
      else
        z := z - 6.07710050630396597660e-11;
        y0 := z - 2.02226624879595063154e-21;
        y1 := (z - y0) - 2.02226624879595063154e-21;
      end if;
      n := 1;
    else
      z := x + 1.57079632673412561417e+00;
      if ix <> 0x3FF921FB then
        y0 := z + 6.07710050650619224932e-11;
        y1 := (z - y0) + 6.07710050650619224932e-11;
      else
        z := z + 6.07710050630396597660e-11;
        y0 := z + 2.02226624879595063154e-21;
        y1 := (z - y0) + 2.02226624879595063154e-21;
      end if;
      n := -1;
    end if;
    kiy := case when 0 = 2 then -1 else 1 end;
  elsif ix > 0x413921FB then
    return fdlibm_trig_large(op => 0, x => x);
  else
    t := abs(x);
    if abs(t) >= 1e-144 and abs(t) <= 1e144 and abs((6.36619772367581382433e-01)::float8) >= 1e-144 and abs((6.36619772367581382433e-01)::float8) <= 1e144 and abs((0.5)::float8) <= 1e288 then
      f_p := t * (6.36619772367581382433e-01)::float8;
      f_ah := (t * 134217729 - (t * 134217729 - t));
      f_e := (t - f_ah) * ((6.36619772367581382433e-01)::float8 - ((6.36619772367581382433e-01)::float8 * 134217729 - ((6.36619772367581382433e-01)::float8 * 134217729 - (6.36619772367581382433e-01)::float8))) - (((f_p - f_ah * ((6.36619772367581382433e-01)::float8 * 134217729 - ((6.36619772367581382433e-01)::float8 * 134217729 - (6.36619772367581382433e-01)::float8))) - (t - f_ah) * ((6.36619772367581382433e-01)::float8 * 134217729 - ((6.36619772367581382433e-01)::float8 * 134217729 - (6.36619772367581382433e-01)::float8))) - f_ah * ((6.36619772367581382433e-01)::float8 - ((6.36619772367581382433e-01)::float8 * 134217729 - ((6.36619772367581382433e-01)::float8 * 134217729 - (6.36619772367581382433e-01)::float8))));
      f_s := (0.5)::float8 + f_p;
      f_tl := ((0.5)::float8 - (f_s - (f_s - (0.5)::float8))) + (f_p - (f_s - (0.5)::float8));
      f_w := (f_tl - ((f_tl + f_e) - ((f_tl + f_e) - f_tl))) + (f_e - ((f_tl + f_e) - f_tl));
      u := f_s + (f_tl + f_e);
      if f_w <> 0 and ((f_s - (u - (u - f_s))) + ((f_tl + f_e) - (u - f_s))) <> 0 and (u + 2 * ((f_s - (u - (u - f_s))) + ((f_tl + f_e) - (u - f_s)))) - u = 2 * ((f_s - (u - (u - f_s))) + ((f_tl + f_e) - (u - f_s))) and (f_w < 0) = (((f_s - (u - (u - f_s))) + ((f_tl + f_e) - (u - f_s))) < 0) then u := u + 2 * ((f_s - (u - (u - f_s))) + ((f_tl + f_e) - (u - f_s))); end if;
    elsif t = 0 or (6.36619772367581382433e-01)::float8 = 0 then
      u := t * (6.36619772367581382433e-01)::float8 + (0.5)::float8;
    else
      u := fdlibm_fma_wide(a => t, b => (6.36619772367581382433e-01)::float8, c => (0.5)::float8);
    end if;
    n := trunc(u)::int;
    fn := n;
    r := t - fn * 1.57079632673412561417e+00;
    w := fn * 6.07710050650619224932e-11;
    y0 := r - w;
    if (case when n < 32 then ix = ('{1073291771,1074340347,1074977148,1075388923,1075800698,1076025724,1076231611,1076437499,1076643386,1076849274,1076971356,1077074300,1077177244,1077280187,1077383131,1077486075,1077589019,1077691962,1077794906,1077897850,1077968460,1078019932,1078071404,1078122876,1078174348,1078225820,1078277292,1078328763,1078380235,1078431707,1078483179,1078534651}'::int[])[n] else true end) then
      j := ix >> 20;
      i := j - (((int8(float8send(y0)) >> 32)::int >> 20) & 0x7FF);
      if i > 16 then
        t := r;
        w := fn * 6.07710050630396597660e-11;
        r := t - w;
        f_c := -((t - r) - w);
        if abs(fn) >= 1e-144 and abs(fn) <= 1e144 and abs((2.02226624879595063154e-21)::float8) >= 1e-144 and abs((2.02226624879595063154e-21)::float8) <= 1e144 and abs(f_c) <= 1e288 then
          f_p := fn * (2.02226624879595063154e-21)::float8;
          f_ah := (fn * 134217729 - (fn * 134217729 - fn));
          f_e := (fn - f_ah) * ((2.02226624879595063154e-21)::float8 - ((2.02226624879595063154e-21)::float8 * 134217729 - ((2.02226624879595063154e-21)::float8 * 134217729 - (2.02226624879595063154e-21)::float8))) - (((f_p - f_ah * ((2.02226624879595063154e-21)::float8 * 134217729 - ((2.02226624879595063154e-21)::float8 * 134217729 - (2.02226624879595063154e-21)::float8))) - (fn - f_ah) * ((2.02226624879595063154e-21)::float8 * 134217729 - ((2.02226624879595063154e-21)::float8 * 134217729 - (2.02226624879595063154e-21)::float8))) - f_ah * ((2.02226624879595063154e-21)::float8 - ((2.02226624879595063154e-21)::float8 * 134217729 - ((2.02226624879595063154e-21)::float8 * 134217729 - (2.02226624879595063154e-21)::float8))));
          f_s := f_c + f_p;
          f_tl := (f_c - (f_s - (f_s - f_c))) + (f_p - (f_s - f_c));
          f_w := (f_tl - ((f_tl + f_e) - ((f_tl + f_e) - f_tl))) + (f_e - ((f_tl + f_e) - f_tl));
          w := f_s + (f_tl + f_e);
          if f_w <> 0 and ((f_s - (w - (w - f_s))) + ((f_tl + f_e) - (w - f_s))) <> 0 and (w + 2 * ((f_s - (w - (w - f_s))) + ((f_tl + f_e) - (w - f_s)))) - w = 2 * ((f_s - (w - (w - f_s))) + ((f_tl + f_e) - (w - f_s))) and (f_w < 0) = (((f_s - (w - (w - f_s))) + ((f_tl + f_e) - (w - f_s))) < 0) then w := w + 2 * ((f_s - (w - (w - f_s))) + ((f_tl + f_e) - (w - f_s))); end if;
        elsif fn = 0 or (2.02226624879595063154e-21)::float8 = 0 then
          w := fn * (2.02226624879595063154e-21)::float8 + f_c;
        else
          w := fdlibm_fma_wide(a => fn, b => (2.02226624879595063154e-21)::float8, c => f_c);
        end if;
        y0 := r - w;
        i := j - (((int8(float8send(y0)) >> 32)::int >> 20) & 0x7FF);
        if i > 49 then
          t := r;
          w := fn * 2.02226624871116645580e-21;
          r := t - w;
          f_c := -((t - r) - w);
          if abs(fn) >= 1e-144 and abs(fn) <= 1e144 and abs((8.47842766036889956997e-32)::float8) >= 1e-144 and abs((8.47842766036889956997e-32)::float8) <= 1e144 and abs(f_c) <= 1e288 then
            f_p := fn * (8.47842766036889956997e-32)::float8;
            f_ah := (fn * 134217729 - (fn * 134217729 - fn));
            f_e := (fn - f_ah) * ((8.47842766036889956997e-32)::float8 - ((8.47842766036889956997e-32)::float8 * 134217729 - ((8.47842766036889956997e-32)::float8 * 134217729 - (8.47842766036889956997e-32)::float8))) - (((f_p - f_ah * ((8.47842766036889956997e-32)::float8 * 134217729 - ((8.47842766036889956997e-32)::float8 * 134217729 - (8.47842766036889956997e-32)::float8))) - (fn - f_ah) * ((8.47842766036889956997e-32)::float8 * 134217729 - ((8.47842766036889956997e-32)::float8 * 134217729 - (8.47842766036889956997e-32)::float8))) - f_ah * ((8.47842766036889956997e-32)::float8 - ((8.47842766036889956997e-32)::float8 * 134217729 - ((8.47842766036889956997e-32)::float8 * 134217729 - (8.47842766036889956997e-32)::float8))));
            f_s := f_c + f_p;
            f_tl := (f_c - (f_s - (f_s - f_c))) + (f_p - (f_s - f_c));
            f_w := (f_tl - ((f_tl + f_e) - ((f_tl + f_e) - f_tl))) + (f_e - ((f_tl + f_e) - f_tl));
            w := f_s + (f_tl + f_e);
            if f_w <> 0 and ((f_s - (w - (w - f_s))) + ((f_tl + f_e) - (w - f_s))) <> 0 and (w + 2 * ((f_s - (w - (w - f_s))) + ((f_tl + f_e) - (w - f_s)))) - w = 2 * ((f_s - (w - (w - f_s))) + ((f_tl + f_e) - (w - f_s))) and (f_w < 0) = (((f_s - (w - (w - f_s))) + ((f_tl + f_e) - (w - f_s))) < 0) then w := w + 2 * ((f_s - (w - (w - f_s))) + ((f_tl + f_e) - (w - f_s))); end if;
          elsif fn = 0 or (8.47842766036889956997e-32)::float8 = 0 then
            w := fn * (8.47842766036889956997e-32)::float8 + f_c;
          else
            w := fdlibm_fma_wide(a => fn, b => (8.47842766036889956997e-32)::float8, c => f_c);
          end if;
          y0 := r - w;
        end if;
      end if;
    end if;
    y1 := (r - y0) - w;
    if hx < 0 then n := -n; y0 := -y0; y1 := -y1; end if;
    kiy := case when 0 = 2 then 1 - ((n & 1) << 1) else 1 end;
  end if;
  -- the kernel of n mod 4 (sin: S C -S -C; cos: C -S -C S; tan: T, -1/T by the parity of n)
  if 0 = 2 then
  k_x := y0;
  k_y := y1;
  k_hx := (int8(float8send(k_x)) >> 32)::int;
  k_ix := k_hx & 2147483647;
  if k_ix < 0x3E300000 then
    if k_ix = 0 and (int8(float8send(k_x)) & 4294967295) = 0 and kiy = -1 then
      res := 'Infinity';
    elsif kiy = 1 then
      res := k_x;
    else
      k_w := k_x + k_y;
      k_z := (trunc((k_w) * (('{2.2250738585072014e-308,4.1045368012983762e-289,7.571533991467358e-270,1.3967014978599092e-250,2.5764595078388533e-231,4.7527289157379e-212,8.767237396033612e-193,1.617269844780878e-173,2.983336292480083e-154,5.503284107318959e-135,1.0151767349262597e-115,1.8726705418768793e-96,3.454467422037778e-77,6.372367644529809e-58,1.1754943508222875e-38,2.168404344971009e-19,4,73786976294838210000,1.361129467683754e+39,2.5108406941546723e+58,4.631683569492648e+77,8.54394814368364e+96,1.5760802478557792e+116,2.9073548971824276e+135,5.363123171977039e+154,9.893216058924181e+173,1.824976247048878e+193,3.366486976990959e+212,6.210072369202836e+231,1.1455561567389984e+251,2.113178124542661e+270,3.89812560456e+289}'::float8[])[(((1043 - ((((int8(float8send(k_w)) >> 32)::int) >> 20) & 2047)) + 1022) >> 6) + 1] * ('{1,2,4,8,16,32,64,128,256,512,1024,2048,4096,8192,16384,32768,65536,131072,262144,524288,1048576,2097152,4194304,8388608,16777216,33554432,67108864,134217728,268435456,536870912,1073741824,2147483648,4294967296,8589934592,17179869184,34359738368,68719476736,137438953472,274877906944,549755813888,1099511627776,2199023255552,4398046511104,8796093022208,17592186044416,35184372088832,70368744177664,140737488355328,281474976710656,562949953421312,1125899906842624,2251799813685248,4503599627370496,9007199254740992,18014398509481984,36028797018963970,72057594037927940,144115188075855870,288230376151711740,576460752303423500,1152921504606847000,2305843009213694000,4611686018427388000,9223372036854776000}'::float8[])[(((1043 - ((((int8(float8send(k_w)) >> 32)::int) >> 20) & 2047)) + 1022) & 63) + 1])) * (('{2.2250738585072014e-308,4.1045368012983762e-289,7.571533991467358e-270,1.3967014978599092e-250,2.5764595078388533e-231,4.7527289157379e-212,8.767237396033612e-193,1.617269844780878e-173,2.983336292480083e-154,5.503284107318959e-135,1.0151767349262597e-115,1.8726705418768793e-96,3.454467422037778e-77,6.372367644529809e-58,1.1754943508222875e-38,2.168404344971009e-19,4,73786976294838210000,1.361129467683754e+39,2.5108406941546723e+58,4.631683569492648e+77,8.54394814368364e+96,1.5760802478557792e+116,2.9073548971824276e+135,5.363123171977039e+154,9.893216058924181e+173,1.824976247048878e+193,3.366486976990959e+212,6.210072369202836e+231,1.1455561567389984e+251,2.113178124542661e+270,3.89812560456e+289}'::float8[])[(((((((int8(float8send(k_w)) >> 32)::int) >> 20) & 2047) - 1043) + 1022) >> 6) + 1] * ('{1,2,4,8,16,32,64,128,256,512,1024,2048,4096,8192,16384,32768,65536,131072,262144,524288,1048576,2097152,4194304,8388608,16777216,33554432,67108864,134217728,268435456,536870912,1073741824,2147483648,4294967296,8589934592,17179869184,34359738368,68719476736,137438953472,274877906944,549755813888,1099511627776,2199023255552,4398046511104,8796093022208,17592186044416,35184372088832,70368744177664,140737488355328,281474976710656,562949953421312,1125899906842624,2251799813685248,4503599627370496,9007199254740992,18014398509481984,36028797018963970,72057594037927940,144115188075855870,288230376151711740,576460752303423500,1152921504606847000,2305843009213694000,4611686018427388000,9223372036854776000}'::float8[])[(((((((int8(float8send(k_w)) >> 32)::int) >> 20) & 2047) - 1043) + 1022) & 63) + 1]));
      k_v := k_y - (k_z - k_x);
      k_a := -1 / k_w;
      k_t := (trunc((k_a) * (('{2.2250738585072014e-308,4.1045368012983762e-289,7.571533991467358e-270,1.3967014978599092e-250,2.5764595078388533e-231,4.7527289157379e-212,8.767237396033612e-193,1.617269844780878e-173,2.983336292480083e-154,5.503284107318959e-135,1.0151767349262597e-115,1.8726705418768793e-96,3.454467422037778e-77,6.372367644529809e-58,1.1754943508222875e-38,2.168404344971009e-19,4,73786976294838210000,1.361129467683754e+39,2.5108406941546723e+58,4.631683569492648e+77,8.54394814368364e+96,1.5760802478557792e+116,2.9073548971824276e+135,5.363123171977039e+154,9.893216058924181e+173,1.824976247048878e+193,3.366486976990959e+212,6.210072369202836e+231,1.1455561567389984e+251,2.113178124542661e+270,3.89812560456e+289}'::float8[])[(((1043 - ((((int8(float8send(k_a)) >> 32)::int) >> 20) & 2047)) + 1022) >> 6) + 1] * ('{1,2,4,8,16,32,64,128,256,512,1024,2048,4096,8192,16384,32768,65536,131072,262144,524288,1048576,2097152,4194304,8388608,16777216,33554432,67108864,134217728,268435456,536870912,1073741824,2147483648,4294967296,8589934592,17179869184,34359738368,68719476736,137438953472,274877906944,549755813888,1099511627776,2199023255552,4398046511104,8796093022208,17592186044416,35184372088832,70368744177664,140737488355328,281474976710656,562949953421312,1125899906842624,2251799813685248,4503599627370496,9007199254740992,18014398509481984,36028797018963970,72057594037927940,144115188075855870,288230376151711740,576460752303423500,1152921504606847000,2305843009213694000,4611686018427388000,9223372036854776000}'::float8[])[(((1043 - ((((int8(float8send(k_a)) >> 32)::int) >> 20) & 2047)) + 1022) & 63) + 1])) * (('{2.2250738585072014e-308,4.1045368012983762e-289,7.571533991467358e-270,1.3967014978599092e-250,2.5764595078388533e-231,4.7527289157379e-212,8.767237396033612e-193,1.617269844780878e-173,2.983336292480083e-154,5.503284107318959e-135,1.0151767349262597e-115,1.8726705418768793e-96,3.454467422037778e-77,6.372367644529809e-58,1.1754943508222875e-38,2.168404344971009e-19,4,73786976294838210000,1.361129467683754e+39,2.5108406941546723e+58,4.631683569492648e+77,8.54394814368364e+96,1.5760802478557792e+116,2.9073548971824276e+135,5.363123171977039e+154,9.893216058924181e+173,1.824976247048878e+193,3.366486976990959e+212,6.210072369202836e+231,1.1455561567389984e+251,2.113178124542661e+270,3.89812560456e+289}'::float8[])[(((((((int8(float8send(k_a)) >> 32)::int) >> 20) & 2047) - 1043) + 1022) >> 6) + 1] * ('{1,2,4,8,16,32,64,128,256,512,1024,2048,4096,8192,16384,32768,65536,131072,262144,524288,1048576,2097152,4194304,8388608,16777216,33554432,67108864,134217728,268435456,536870912,1073741824,2147483648,4294967296,8589934592,17179869184,34359738368,68719476736,137438953472,274877906944,549755813888,1099511627776,2199023255552,4398046511104,8796093022208,17592186044416,35184372088832,70368744177664,140737488355328,281474976710656,562949953421312,1125899906842624,2251799813685248,4503599627370496,9007199254740992,18014398509481984,36028797018963970,72057594037927940,144115188075855870,288230376151711740,576460752303423500,1152921504606847000,2305843009213694000,4611686018427388000,9223372036854776000}'::float8[])[(((((((int8(float8send(k_a)) >> 32)::int) >> 20) & 2047) - 1043) + 1022) & 63) + 1]));
      if abs(k_t) >= 1e-144 and abs(k_t) <= 1e144 and abs(k_z) >= 1e-144 and abs(k_z) <= 1e144 and abs((1)::float8) <= 1e288 then
        f_p := k_t * k_z;
        f_ah := (k_t * 134217729 - (k_t * 134217729 - k_t));
        f_bh := (k_z * 134217729 - (k_z * 134217729 - k_z));
        f_e := (k_t - f_ah) * (k_z - f_bh) - (((f_p - f_ah * f_bh) - (k_t - f_ah) * f_bh) - f_ah * (k_z - f_bh));
        f_s := (1)::float8 + f_p;
        f_tl := ((1)::float8 - (f_s - (f_s - (1)::float8))) + (f_p - (f_s - (1)::float8));
        f_w := (f_tl - ((f_tl + f_e) - ((f_tl + f_e) - f_tl))) + (f_e - ((f_tl + f_e) - f_tl));
        k_s := f_s + (f_tl + f_e);
        if f_w <> 0 and ((f_s - (k_s - (k_s - f_s))) + ((f_tl + f_e) - (k_s - f_s))) <> 0 and (k_s + 2 * ((f_s - (k_s - (k_s - f_s))) + ((f_tl + f_e) - (k_s - f_s)))) - k_s = 2 * ((f_s - (k_s - (k_s - f_s))) + ((f_tl + f_e) - (k_s - f_s))) and (f_w < 0) = (((f_s - (k_s - (k_s - f_s))) + ((f_tl + f_e) - (k_s - f_s))) < 0) then k_s := k_s + 2 * ((f_s - (k_s - (k_s - f_s))) + ((f_tl + f_e) - (k_s - f_s))); end if;
      elsif k_t = 0 or k_z = 0 then
        k_s := k_t * k_z + (1)::float8;
      else
        k_s := fdlibm_fma_wide(a => k_t, b => k_z, c => (1)::float8);
      end if;
      if abs(k_t) >= 1e-144 and abs(k_t) <= 1e144 and abs(k_v) >= 1e-144 and abs(k_v) <= 1e144 and abs(k_s) <= 1e288 then
        f_p := k_t * k_v;
        f_ah := (k_t * 134217729 - (k_t * 134217729 - k_t));
        f_bh := (k_v * 134217729 - (k_v * 134217729 - k_v));
        f_e := (k_t - f_ah) * (k_v - f_bh) - (((f_p - f_ah * f_bh) - (k_t - f_ah) * f_bh) - f_ah * (k_v - f_bh));
        f_s := k_s + f_p;
        f_tl := (k_s - (f_s - (f_s - k_s))) + (f_p - (f_s - k_s));
        f_w := (f_tl - ((f_tl + f_e) - ((f_tl + f_e) - f_tl))) + (f_e - ((f_tl + f_e) - f_tl));
        k_u := f_s + (f_tl + f_e);
        if f_w <> 0 and ((f_s - (k_u - (k_u - f_s))) + ((f_tl + f_e) - (k_u - f_s))) <> 0 and (k_u + 2 * ((f_s - (k_u - (k_u - f_s))) + ((f_tl + f_e) - (k_u - f_s)))) - k_u = 2 * ((f_s - (k_u - (k_u - f_s))) + ((f_tl + f_e) - (k_u - f_s))) and (f_w < 0) = (((f_s - (k_u - (k_u - f_s))) + ((f_tl + f_e) - (k_u - f_s))) < 0) then k_u := k_u + 2 * ((f_s - (k_u - (k_u - f_s))) + ((f_tl + f_e) - (k_u - f_s))); end if;
      elsif k_t = 0 or k_v = 0 then
        k_u := k_t * k_v + k_s;
      else
        k_u := fdlibm_fma_wide(a => k_t, b => k_v, c => k_s);
      end if;
      if abs(k_a) >= 1e-144 and abs(k_a) <= 1e144 and abs(k_u) >= 1e-144 and abs(k_u) <= 1e144 and abs(k_t) <= 1e288 then
        f_p := k_a * k_u;
        f_ah := (k_a * 134217729 - (k_a * 134217729 - k_a));
        f_bh := (k_u * 134217729 - (k_u * 134217729 - k_u));
        f_e := (k_a - f_ah) * (k_u - f_bh) - (((f_p - f_ah * f_bh) - (k_a - f_ah) * f_bh) - f_ah * (k_u - f_bh));
        f_s := k_t + f_p;
        f_tl := (k_t - (f_s - (f_s - k_t))) + (f_p - (f_s - k_t));
        f_w := (f_tl - ((f_tl + f_e) - ((f_tl + f_e) - f_tl))) + (f_e - ((f_tl + f_e) - f_tl));
        res := f_s + (f_tl + f_e);
        if f_w <> 0 and ((f_s - (res - (res - f_s))) + ((f_tl + f_e) - (res - f_s))) <> 0 and (res + 2 * ((f_s - (res - (res - f_s))) + ((f_tl + f_e) - (res - f_s)))) - res = 2 * ((f_s - (res - (res - f_s))) + ((f_tl + f_e) - (res - f_s))) and (f_w < 0) = (((f_s - (res - (res - f_s))) + ((f_tl + f_e) - (res - f_s))) < 0) then res := res + 2 * ((f_s - (res - (res - f_s))) + ((f_tl + f_e) - (res - f_s))); end if;
      elsif k_a = 0 or k_u = 0 then
        res := k_a * k_u + k_t;
      else
        res := fdlibm_fma_wide(a => k_a, b => k_u, c => k_t);
      end if;
    end if;
  else
    if k_ix >= 0x3FE59428 then
      if k_hx < 0 then k_x := -k_x; k_y := -k_y; end if;
      k_z := 7.85398163397448278999e-01 - k_x;
      k_w := 3.06161699786838301793e-17 - k_y;
      k_x := k_z + k_w;
      k_y := 0;
    end if;
    k_z := k_x * k_x;
    k_w := k_z * k_z;
    if abs(k_w) >= 1e-144 and abs(k_w) <= 1e144 and abs((-1.85586374855275456654e-05)::float8) >= 1e-144 and abs((-1.85586374855275456654e-05)::float8) <= 1e144 and abs((7.81794442939557092300e-05)::float8) <= 1e288 then
      f_p := k_w * (-1.85586374855275456654e-05)::float8;
      f_ah := (k_w * 134217729 - (k_w * 134217729 - k_w));
      f_e := (k_w - f_ah) * ((-1.85586374855275456654e-05)::float8 - ((-1.85586374855275456654e-05)::float8 * 134217729 - ((-1.85586374855275456654e-05)::float8 * 134217729 - (-1.85586374855275456654e-05)::float8))) - (((f_p - f_ah * ((-1.85586374855275456654e-05)::float8 * 134217729 - ((-1.85586374855275456654e-05)::float8 * 134217729 - (-1.85586374855275456654e-05)::float8))) - (k_w - f_ah) * ((-1.85586374855275456654e-05)::float8 * 134217729 - ((-1.85586374855275456654e-05)::float8 * 134217729 - (-1.85586374855275456654e-05)::float8))) - f_ah * ((-1.85586374855275456654e-05)::float8 - ((-1.85586374855275456654e-05)::float8 * 134217729 - ((-1.85586374855275456654e-05)::float8 * 134217729 - (-1.85586374855275456654e-05)::float8))));
      f_s := (7.81794442939557092300e-05)::float8 + f_p;
      f_tl := ((7.81794442939557092300e-05)::float8 - (f_s - (f_s - (7.81794442939557092300e-05)::float8))) + (f_p - (f_s - (7.81794442939557092300e-05)::float8));
      f_w := (f_tl - ((f_tl + f_e) - ((f_tl + f_e) - f_tl))) + (f_e - ((f_tl + f_e) - f_tl));
      k_r := f_s + (f_tl + f_e);
      if f_w <> 0 and ((f_s - (k_r - (k_r - f_s))) + ((f_tl + f_e) - (k_r - f_s))) <> 0 and (k_r + 2 * ((f_s - (k_r - (k_r - f_s))) + ((f_tl + f_e) - (k_r - f_s)))) - k_r = 2 * ((f_s - (k_r - (k_r - f_s))) + ((f_tl + f_e) - (k_r - f_s))) and (f_w < 0) = (((f_s - (k_r - (k_r - f_s))) + ((f_tl + f_e) - (k_r - f_s))) < 0) then k_r := k_r + 2 * ((f_s - (k_r - (k_r - f_s))) + ((f_tl + f_e) - (k_r - f_s))); end if;
    elsif k_w = 0 or (-1.85586374855275456654e-05)::float8 = 0 then
      k_r := k_w * (-1.85586374855275456654e-05)::float8 + (7.81794442939557092300e-05)::float8;
    else
      k_r := fdlibm_fma_wide(a => k_w, b => (-1.85586374855275456654e-05)::float8, c => (7.81794442939557092300e-05)::float8);
    end if;
    if abs(k_w) >= 1e-144 and abs(k_w) <= 1e144 and abs(k_r) >= 1e-144 and abs(k_r) <= 1e144 and abs((5.88041240820264096874e-04)::float8) <= 1e288 then
      f_p := k_w * k_r;
      f_ah := (k_w * 134217729 - (k_w * 134217729 - k_w));
      f_bh := (k_r * 134217729 - (k_r * 134217729 - k_r));
      f_e := (k_w - f_ah) * (k_r - f_bh) - (((f_p - f_ah * f_bh) - (k_w - f_ah) * f_bh) - f_ah * (k_r - f_bh));
      f_s := (5.88041240820264096874e-04)::float8 + f_p;
      f_tl := ((5.88041240820264096874e-04)::float8 - (f_s - (f_s - (5.88041240820264096874e-04)::float8))) + (f_p - (f_s - (5.88041240820264096874e-04)::float8));
      f_w := (f_tl - ((f_tl + f_e) - ((f_tl + f_e) - f_tl))) + (f_e - ((f_tl + f_e) - f_tl));
      k_r := f_s + (f_tl + f_e);
      if f_w <> 0 and ((f_s - (k_r - (k_r - f_s))) + ((f_tl + f_e) - (k_r - f_s))) <> 0 and (k_r + 2 * ((f_s - (k_r - (k_r - f_s))) + ((f_tl + f_e) - (k_r - f_s)))) - k_r = 2 * ((f_s - (k_r - (k_r - f_s))) + ((f_tl + f_e) - (k_r - f_s))) and (f_w < 0) = (((f_s - (k_r - (k_r - f_s))) + ((f_tl + f_e) - (k_r - f_s))) < 0) then k_r := k_r + 2 * ((f_s - (k_r - (k_r - f_s))) + ((f_tl + f_e) - (k_r - f_s))); end if;
    elsif k_w = 0 or k_r = 0 then
      k_r := k_w * k_r + (5.88041240820264096874e-04)::float8;
    else
      k_r := fdlibm_fma_wide(a => k_w, b => k_r, c => (5.88041240820264096874e-04)::float8);
    end if;
    if abs(k_w) >= 1e-144 and abs(k_w) <= 1e144 and abs(k_r) >= 1e-144 and abs(k_r) <= 1e144 and abs((3.59207910759131235356e-03)::float8) <= 1e288 then
      f_p := k_w * k_r;
      f_ah := (k_w * 134217729 - (k_w * 134217729 - k_w));
      f_bh := (k_r * 134217729 - (k_r * 134217729 - k_r));
      f_e := (k_w - f_ah) * (k_r - f_bh) - (((f_p - f_ah * f_bh) - (k_w - f_ah) * f_bh) - f_ah * (k_r - f_bh));
      f_s := (3.59207910759131235356e-03)::float8 + f_p;
      f_tl := ((3.59207910759131235356e-03)::float8 - (f_s - (f_s - (3.59207910759131235356e-03)::float8))) + (f_p - (f_s - (3.59207910759131235356e-03)::float8));
      f_w := (f_tl - ((f_tl + f_e) - ((f_tl + f_e) - f_tl))) + (f_e - ((f_tl + f_e) - f_tl));
      k_r := f_s + (f_tl + f_e);
      if f_w <> 0 and ((f_s - (k_r - (k_r - f_s))) + ((f_tl + f_e) - (k_r - f_s))) <> 0 and (k_r + 2 * ((f_s - (k_r - (k_r - f_s))) + ((f_tl + f_e) - (k_r - f_s)))) - k_r = 2 * ((f_s - (k_r - (k_r - f_s))) + ((f_tl + f_e) - (k_r - f_s))) and (f_w < 0) = (((f_s - (k_r - (k_r - f_s))) + ((f_tl + f_e) - (k_r - f_s))) < 0) then k_r := k_r + 2 * ((f_s - (k_r - (k_r - f_s))) + ((f_tl + f_e) - (k_r - f_s))); end if;
    elsif k_w = 0 or k_r = 0 then
      k_r := k_w * k_r + (3.59207910759131235356e-03)::float8;
    else
      k_r := fdlibm_fma_wide(a => k_w, b => k_r, c => (3.59207910759131235356e-03)::float8);
    end if;
    if abs(k_w) >= 1e-144 and abs(k_w) <= 1e144 and abs(k_r) >= 1e-144 and abs(k_r) <= 1e144 and abs((2.18694882948595424599e-02)::float8) <= 1e288 then
      f_p := k_w * k_r;
      f_ah := (k_w * 134217729 - (k_w * 134217729 - k_w));
      f_bh := (k_r * 134217729 - (k_r * 134217729 - k_r));
      f_e := (k_w - f_ah) * (k_r - f_bh) - (((f_p - f_ah * f_bh) - (k_w - f_ah) * f_bh) - f_ah * (k_r - f_bh));
      f_s := (2.18694882948595424599e-02)::float8 + f_p;
      f_tl := ((2.18694882948595424599e-02)::float8 - (f_s - (f_s - (2.18694882948595424599e-02)::float8))) + (f_p - (f_s - (2.18694882948595424599e-02)::float8));
      f_w := (f_tl - ((f_tl + f_e) - ((f_tl + f_e) - f_tl))) + (f_e - ((f_tl + f_e) - f_tl));
      k_r := f_s + (f_tl + f_e);
      if f_w <> 0 and ((f_s - (k_r - (k_r - f_s))) + ((f_tl + f_e) - (k_r - f_s))) <> 0 and (k_r + 2 * ((f_s - (k_r - (k_r - f_s))) + ((f_tl + f_e) - (k_r - f_s)))) - k_r = 2 * ((f_s - (k_r - (k_r - f_s))) + ((f_tl + f_e) - (k_r - f_s))) and (f_w < 0) = (((f_s - (k_r - (k_r - f_s))) + ((f_tl + f_e) - (k_r - f_s))) < 0) then k_r := k_r + 2 * ((f_s - (k_r - (k_r - f_s))) + ((f_tl + f_e) - (k_r - f_s))); end if;
    elsif k_w = 0 or k_r = 0 then
      k_r := k_w * k_r + (2.18694882948595424599e-02)::float8;
    else
      k_r := fdlibm_fma_wide(a => k_w, b => k_r, c => (2.18694882948595424599e-02)::float8);
    end if;
    if abs(k_w) >= 1e-144 and abs(k_w) <= 1e144 and abs(k_r) >= 1e-144 and abs(k_r) <= 1e144 and abs((1.33333333333201242699e-01)::float8) <= 1e288 then
      f_p := k_w * k_r;
      f_ah := (k_w * 134217729 - (k_w * 134217729 - k_w));
      f_bh := (k_r * 134217729 - (k_r * 134217729 - k_r));
      f_e := (k_w - f_ah) * (k_r - f_bh) - (((f_p - f_ah * f_bh) - (k_w - f_ah) * f_bh) - f_ah * (k_r - f_bh));
      f_s := (1.33333333333201242699e-01)::float8 + f_p;
      f_tl := ((1.33333333333201242699e-01)::float8 - (f_s - (f_s - (1.33333333333201242699e-01)::float8))) + (f_p - (f_s - (1.33333333333201242699e-01)::float8));
      f_w := (f_tl - ((f_tl + f_e) - ((f_tl + f_e) - f_tl))) + (f_e - ((f_tl + f_e) - f_tl));
      k_r := f_s + (f_tl + f_e);
      if f_w <> 0 and ((f_s - (k_r - (k_r - f_s))) + ((f_tl + f_e) - (k_r - f_s))) <> 0 and (k_r + 2 * ((f_s - (k_r - (k_r - f_s))) + ((f_tl + f_e) - (k_r - f_s)))) - k_r = 2 * ((f_s - (k_r - (k_r - f_s))) + ((f_tl + f_e) - (k_r - f_s))) and (f_w < 0) = (((f_s - (k_r - (k_r - f_s))) + ((f_tl + f_e) - (k_r - f_s))) < 0) then k_r := k_r + 2 * ((f_s - (k_r - (k_r - f_s))) + ((f_tl + f_e) - (k_r - f_s))); end if;
    elsif k_w = 0 or k_r = 0 then
      k_r := k_w * k_r + (1.33333333333201242699e-01)::float8;
    else
      k_r := fdlibm_fma_wide(a => k_w, b => k_r, c => (1.33333333333201242699e-01)::float8);
    end if;
    if abs(k_w) >= 1e-144 and abs(k_w) <= 1e144 and abs((2.59073051863633712884e-05)::float8) >= 1e-144 and abs((2.59073051863633712884e-05)::float8) <= 1e144 and abs((7.14072491382608190305e-05)::float8) <= 1e288 then
      f_p := k_w * (2.59073051863633712884e-05)::float8;
      f_ah := (k_w * 134217729 - (k_w * 134217729 - k_w));
      f_e := (k_w - f_ah) * ((2.59073051863633712884e-05)::float8 - ((2.59073051863633712884e-05)::float8 * 134217729 - ((2.59073051863633712884e-05)::float8 * 134217729 - (2.59073051863633712884e-05)::float8))) - (((f_p - f_ah * ((2.59073051863633712884e-05)::float8 * 134217729 - ((2.59073051863633712884e-05)::float8 * 134217729 - (2.59073051863633712884e-05)::float8))) - (k_w - f_ah) * ((2.59073051863633712884e-05)::float8 * 134217729 - ((2.59073051863633712884e-05)::float8 * 134217729 - (2.59073051863633712884e-05)::float8))) - f_ah * ((2.59073051863633712884e-05)::float8 - ((2.59073051863633712884e-05)::float8 * 134217729 - ((2.59073051863633712884e-05)::float8 * 134217729 - (2.59073051863633712884e-05)::float8))));
      f_s := (7.14072491382608190305e-05)::float8 + f_p;
      f_tl := ((7.14072491382608190305e-05)::float8 - (f_s - (f_s - (7.14072491382608190305e-05)::float8))) + (f_p - (f_s - (7.14072491382608190305e-05)::float8));
      f_w := (f_tl - ((f_tl + f_e) - ((f_tl + f_e) - f_tl))) + (f_e - ((f_tl + f_e) - f_tl));
      k_v := f_s + (f_tl + f_e);
      if f_w <> 0 and ((f_s - (k_v - (k_v - f_s))) + ((f_tl + f_e) - (k_v - f_s))) <> 0 and (k_v + 2 * ((f_s - (k_v - (k_v - f_s))) + ((f_tl + f_e) - (k_v - f_s)))) - k_v = 2 * ((f_s - (k_v - (k_v - f_s))) + ((f_tl + f_e) - (k_v - f_s))) and (f_w < 0) = (((f_s - (k_v - (k_v - f_s))) + ((f_tl + f_e) - (k_v - f_s))) < 0) then k_v := k_v + 2 * ((f_s - (k_v - (k_v - f_s))) + ((f_tl + f_e) - (k_v - f_s))); end if;
    elsif k_w = 0 or (2.59073051863633712884e-05)::float8 = 0 then
      k_v := k_w * (2.59073051863633712884e-05)::float8 + (7.14072491382608190305e-05)::float8;
    else
      k_v := fdlibm_fma_wide(a => k_w, b => (2.59073051863633712884e-05)::float8, c => (7.14072491382608190305e-05)::float8);
    end if;
    if abs(k_w) >= 1e-144 and abs(k_w) <= 1e144 and abs(k_v) >= 1e-144 and abs(k_v) <= 1e144 and abs((2.46463134818469906812e-04)::float8) <= 1e288 then
      f_p := k_w * k_v;
      f_ah := (k_w * 134217729 - (k_w * 134217729 - k_w));
      f_bh := (k_v * 134217729 - (k_v * 134217729 - k_v));
      f_e := (k_w - f_ah) * (k_v - f_bh) - (((f_p - f_ah * f_bh) - (k_w - f_ah) * f_bh) - f_ah * (k_v - f_bh));
      f_s := (2.46463134818469906812e-04)::float8 + f_p;
      f_tl := ((2.46463134818469906812e-04)::float8 - (f_s - (f_s - (2.46463134818469906812e-04)::float8))) + (f_p - (f_s - (2.46463134818469906812e-04)::float8));
      f_w := (f_tl - ((f_tl + f_e) - ((f_tl + f_e) - f_tl))) + (f_e - ((f_tl + f_e) - f_tl));
      k_v := f_s + (f_tl + f_e);
      if f_w <> 0 and ((f_s - (k_v - (k_v - f_s))) + ((f_tl + f_e) - (k_v - f_s))) <> 0 and (k_v + 2 * ((f_s - (k_v - (k_v - f_s))) + ((f_tl + f_e) - (k_v - f_s)))) - k_v = 2 * ((f_s - (k_v - (k_v - f_s))) + ((f_tl + f_e) - (k_v - f_s))) and (f_w < 0) = (((f_s - (k_v - (k_v - f_s))) + ((f_tl + f_e) - (k_v - f_s))) < 0) then k_v := k_v + 2 * ((f_s - (k_v - (k_v - f_s))) + ((f_tl + f_e) - (k_v - f_s))); end if;
    elsif k_w = 0 or k_v = 0 then
      k_v := k_w * k_v + (2.46463134818469906812e-04)::float8;
    else
      k_v := fdlibm_fma_wide(a => k_w, b => k_v, c => (2.46463134818469906812e-04)::float8);
    end if;
    if abs(k_w) >= 1e-144 and abs(k_w) <= 1e144 and abs(k_v) >= 1e-144 and abs(k_v) <= 1e144 and abs((1.45620945432529025516e-03)::float8) <= 1e288 then
      f_p := k_w * k_v;
      f_ah := (k_w * 134217729 - (k_w * 134217729 - k_w));
      f_bh := (k_v * 134217729 - (k_v * 134217729 - k_v));
      f_e := (k_w - f_ah) * (k_v - f_bh) - (((f_p - f_ah * f_bh) - (k_w - f_ah) * f_bh) - f_ah * (k_v - f_bh));
      f_s := (1.45620945432529025516e-03)::float8 + f_p;
      f_tl := ((1.45620945432529025516e-03)::float8 - (f_s - (f_s - (1.45620945432529025516e-03)::float8))) + (f_p - (f_s - (1.45620945432529025516e-03)::float8));
      f_w := (f_tl - ((f_tl + f_e) - ((f_tl + f_e) - f_tl))) + (f_e - ((f_tl + f_e) - f_tl));
      k_v := f_s + (f_tl + f_e);
      if f_w <> 0 and ((f_s - (k_v - (k_v - f_s))) + ((f_tl + f_e) - (k_v - f_s))) <> 0 and (k_v + 2 * ((f_s - (k_v - (k_v - f_s))) + ((f_tl + f_e) - (k_v - f_s)))) - k_v = 2 * ((f_s - (k_v - (k_v - f_s))) + ((f_tl + f_e) - (k_v - f_s))) and (f_w < 0) = (((f_s - (k_v - (k_v - f_s))) + ((f_tl + f_e) - (k_v - f_s))) < 0) then k_v := k_v + 2 * ((f_s - (k_v - (k_v - f_s))) + ((f_tl + f_e) - (k_v - f_s))); end if;
    elsif k_w = 0 or k_v = 0 then
      k_v := k_w * k_v + (1.45620945432529025516e-03)::float8;
    else
      k_v := fdlibm_fma_wide(a => k_w, b => k_v, c => (1.45620945432529025516e-03)::float8);
    end if;
    if abs(k_w) >= 1e-144 and abs(k_w) <= 1e144 and abs(k_v) >= 1e-144 and abs(k_v) <= 1e144 and abs((8.86323982359930005737e-03)::float8) <= 1e288 then
      f_p := k_w * k_v;
      f_ah := (k_w * 134217729 - (k_w * 134217729 - k_w));
      f_bh := (k_v * 134217729 - (k_v * 134217729 - k_v));
      f_e := (k_w - f_ah) * (k_v - f_bh) - (((f_p - f_ah * f_bh) - (k_w - f_ah) * f_bh) - f_ah * (k_v - f_bh));
      f_s := (8.86323982359930005737e-03)::float8 + f_p;
      f_tl := ((8.86323982359930005737e-03)::float8 - (f_s - (f_s - (8.86323982359930005737e-03)::float8))) + (f_p - (f_s - (8.86323982359930005737e-03)::float8));
      f_w := (f_tl - ((f_tl + f_e) - ((f_tl + f_e) - f_tl))) + (f_e - ((f_tl + f_e) - f_tl));
      k_v := f_s + (f_tl + f_e);
      if f_w <> 0 and ((f_s - (k_v - (k_v - f_s))) + ((f_tl + f_e) - (k_v - f_s))) <> 0 and (k_v + 2 * ((f_s - (k_v - (k_v - f_s))) + ((f_tl + f_e) - (k_v - f_s)))) - k_v = 2 * ((f_s - (k_v - (k_v - f_s))) + ((f_tl + f_e) - (k_v - f_s))) and (f_w < 0) = (((f_s - (k_v - (k_v - f_s))) + ((f_tl + f_e) - (k_v - f_s))) < 0) then k_v := k_v + 2 * ((f_s - (k_v - (k_v - f_s))) + ((f_tl + f_e) - (k_v - f_s))); end if;
    elsif k_w = 0 or k_v = 0 then
      k_v := k_w * k_v + (8.86323982359930005737e-03)::float8;
    else
      k_v := fdlibm_fma_wide(a => k_w, b => k_v, c => (8.86323982359930005737e-03)::float8);
    end if;
    if abs(k_w) >= 1e-144 and abs(k_w) <= 1e144 and abs(k_v) >= 1e-144 and abs(k_v) <= 1e144 and abs((5.39682539762260521377e-02)::float8) <= 1e288 then
      f_p := k_w * k_v;
      f_ah := (k_w * 134217729 - (k_w * 134217729 - k_w));
      f_bh := (k_v * 134217729 - (k_v * 134217729 - k_v));
      f_e := (k_w - f_ah) * (k_v - f_bh) - (((f_p - f_ah * f_bh) - (k_w - f_ah) * f_bh) - f_ah * (k_v - f_bh));
      f_s := (5.39682539762260521377e-02)::float8 + f_p;
      f_tl := ((5.39682539762260521377e-02)::float8 - (f_s - (f_s - (5.39682539762260521377e-02)::float8))) + (f_p - (f_s - (5.39682539762260521377e-02)::float8));
      f_w := (f_tl - ((f_tl + f_e) - ((f_tl + f_e) - f_tl))) + (f_e - ((f_tl + f_e) - f_tl));
      k_v := f_s + (f_tl + f_e);
      if f_w <> 0 and ((f_s - (k_v - (k_v - f_s))) + ((f_tl + f_e) - (k_v - f_s))) <> 0 and (k_v + 2 * ((f_s - (k_v - (k_v - f_s))) + ((f_tl + f_e) - (k_v - f_s)))) - k_v = 2 * ((f_s - (k_v - (k_v - f_s))) + ((f_tl + f_e) - (k_v - f_s))) and (f_w < 0) = (((f_s - (k_v - (k_v - f_s))) + ((f_tl + f_e) - (k_v - f_s))) < 0) then k_v := k_v + 2 * ((f_s - (k_v - (k_v - f_s))) + ((f_tl + f_e) - (k_v - f_s))); end if;
    elsif k_w = 0 or k_v = 0 then
      k_v := k_w * k_v + (5.39682539762260521377e-02)::float8;
    else
      k_v := fdlibm_fma_wide(a => k_w, b => k_v, c => (5.39682539762260521377e-02)::float8);
    end if;
    k_v := k_z * k_v;
    k_s := k_z * k_x;
    f_b := k_r + k_v;
    if abs(k_s) >= 1e-144 and abs(k_s) <= 1e144 and abs(f_b) >= 1e-144 and abs(f_b) <= 1e144 and abs(k_y) <= 1e288 then
      f_p := k_s * f_b;
      f_ah := (k_s * 134217729 - (k_s * 134217729 - k_s));
      f_bh := (f_b * 134217729 - (f_b * 134217729 - f_b));
      f_e := (k_s - f_ah) * (f_b - f_bh) - (((f_p - f_ah * f_bh) - (k_s - f_ah) * f_bh) - f_ah * (f_b - f_bh));
      f_s := k_y + f_p;
      f_tl := (k_y - (f_s - (f_s - k_y))) + (f_p - (f_s - k_y));
      f_w := (f_tl - ((f_tl + f_e) - ((f_tl + f_e) - f_tl))) + (f_e - ((f_tl + f_e) - f_tl));
      k_u := f_s + (f_tl + f_e);
      if f_w <> 0 and ((f_s - (k_u - (k_u - f_s))) + ((f_tl + f_e) - (k_u - f_s))) <> 0 and (k_u + 2 * ((f_s - (k_u - (k_u - f_s))) + ((f_tl + f_e) - (k_u - f_s)))) - k_u = 2 * ((f_s - (k_u - (k_u - f_s))) + ((f_tl + f_e) - (k_u - f_s))) and (f_w < 0) = (((f_s - (k_u - (k_u - f_s))) + ((f_tl + f_e) - (k_u - f_s))) < 0) then k_u := k_u + 2 * ((f_s - (k_u - (k_u - f_s))) + ((f_tl + f_e) - (k_u - f_s))); end if;
    elsif k_s = 0 or f_b = 0 then
      k_u := k_s * f_b + k_y;
    else
      k_u := fdlibm_fma_wide(a => k_s, b => f_b, c => k_y);
    end if;
    if abs(k_z) >= 1e-144 and abs(k_z) <= 1e144 and abs(k_u) >= 1e-144 and abs(k_u) <= 1e144 and abs(k_y) <= 1e288 then
      f_p := k_z * k_u;
      f_ah := (k_z * 134217729 - (k_z * 134217729 - k_z));
      f_bh := (k_u * 134217729 - (k_u * 134217729 - k_u));
      f_e := (k_z - f_ah) * (k_u - f_bh) - (((f_p - f_ah * f_bh) - (k_z - f_ah) * f_bh) - f_ah * (k_u - f_bh));
      f_s := k_y + f_p;
      f_tl := (k_y - (f_s - (f_s - k_y))) + (f_p - (f_s - k_y));
      f_w := (f_tl - ((f_tl + f_e) - ((f_tl + f_e) - f_tl))) + (f_e - ((f_tl + f_e) - f_tl));
      k_r := f_s + (f_tl + f_e);
      if f_w <> 0 and ((f_s - (k_r - (k_r - f_s))) + ((f_tl + f_e) - (k_r - f_s))) <> 0 and (k_r + 2 * ((f_s - (k_r - (k_r - f_s))) + ((f_tl + f_e) - (k_r - f_s)))) - k_r = 2 * ((f_s - (k_r - (k_r - f_s))) + ((f_tl + f_e) - (k_r - f_s))) and (f_w < 0) = (((f_s - (k_r - (k_r - f_s))) + ((f_tl + f_e) - (k_r - f_s))) < 0) then k_r := k_r + 2 * ((f_s - (k_r - (k_r - f_s))) + ((f_tl + f_e) - (k_r - f_s))); end if;
    elsif k_z = 0 or k_u = 0 then
      k_r := k_z * k_u + k_y;
    else
      k_r := fdlibm_fma_wide(a => k_z, b => k_u, c => k_y);
    end if;
    if abs((3.33333333333334091986e-01)::float8) >= 1e-144 and abs((3.33333333333334091986e-01)::float8) <= 1e144 and abs(k_s) >= 1e-144 and abs(k_s) <= 1e144 and abs(k_r) <= 1e288 then
      f_p := (3.33333333333334091986e-01)::float8 * k_s;
      f_bh := (k_s * 134217729 - (k_s * 134217729 - k_s));
      f_e := ((3.33333333333334091986e-01)::float8 - ((3.33333333333334091986e-01)::float8 * 134217729 - ((3.33333333333334091986e-01)::float8 * 134217729 - (3.33333333333334091986e-01)::float8))) * (k_s - f_bh) - (((f_p - ((3.33333333333334091986e-01)::float8 * 134217729 - ((3.33333333333334091986e-01)::float8 * 134217729 - (3.33333333333334091986e-01)::float8)) * f_bh) - ((3.33333333333334091986e-01)::float8 - ((3.33333333333334091986e-01)::float8 * 134217729 - ((3.33333333333334091986e-01)::float8 * 134217729 - (3.33333333333334091986e-01)::float8))) * f_bh) - ((3.33333333333334091986e-01)::float8 * 134217729 - ((3.33333333333334091986e-01)::float8 * 134217729 - (3.33333333333334091986e-01)::float8)) * (k_s - f_bh));
      f_s := k_r + f_p;
      f_tl := (k_r - (f_s - (f_s - k_r))) + (f_p - (f_s - k_r));
      f_w := (f_tl - ((f_tl + f_e) - ((f_tl + f_e) - f_tl))) + (f_e - ((f_tl + f_e) - f_tl));
      k_r := f_s + (f_tl + f_e);
      if f_w <> 0 and ((f_s - (k_r - (k_r - f_s))) + ((f_tl + f_e) - (k_r - f_s))) <> 0 and (k_r + 2 * ((f_s - (k_r - (k_r - f_s))) + ((f_tl + f_e) - (k_r - f_s)))) - k_r = 2 * ((f_s - (k_r - (k_r - f_s))) + ((f_tl + f_e) - (k_r - f_s))) and (f_w < 0) = (((f_s - (k_r - (k_r - f_s))) + ((f_tl + f_e) - (k_r - f_s))) < 0) then k_r := k_r + 2 * ((f_s - (k_r - (k_r - f_s))) + ((f_tl + f_e) - (k_r - f_s))); end if;
    elsif (3.33333333333334091986e-01)::float8 = 0 or k_s = 0 then
      k_r := (3.33333333333334091986e-01)::float8 * k_s + k_r;
    else
      k_r := fdlibm_fma_wide(a => (3.33333333333334091986e-01)::float8, b => k_s, c => k_r);
    end if;
    k_w := k_x + k_r;
    if k_ix >= 0x3FE59428 then
      k_v := kiy;
      res := (1 - ((k_hx >> 30) & 2)) * (k_v - 2 * (k_x - (k_w * k_w / (k_w + k_v) - k_r)));
    elsif kiy = 1 then
      res := k_w;
    else
      k_z := (trunc((k_w) * (('{2.2250738585072014e-308,4.1045368012983762e-289,7.571533991467358e-270,1.3967014978599092e-250,2.5764595078388533e-231,4.7527289157379e-212,8.767237396033612e-193,1.617269844780878e-173,2.983336292480083e-154,5.503284107318959e-135,1.0151767349262597e-115,1.8726705418768793e-96,3.454467422037778e-77,6.372367644529809e-58,1.1754943508222875e-38,2.168404344971009e-19,4,73786976294838210000,1.361129467683754e+39,2.5108406941546723e+58,4.631683569492648e+77,8.54394814368364e+96,1.5760802478557792e+116,2.9073548971824276e+135,5.363123171977039e+154,9.893216058924181e+173,1.824976247048878e+193,3.366486976990959e+212,6.210072369202836e+231,1.1455561567389984e+251,2.113178124542661e+270,3.89812560456e+289}'::float8[])[(((1043 - ((((int8(float8send(k_w)) >> 32)::int) >> 20) & 2047)) + 1022) >> 6) + 1] * ('{1,2,4,8,16,32,64,128,256,512,1024,2048,4096,8192,16384,32768,65536,131072,262144,524288,1048576,2097152,4194304,8388608,16777216,33554432,67108864,134217728,268435456,536870912,1073741824,2147483648,4294967296,8589934592,17179869184,34359738368,68719476736,137438953472,274877906944,549755813888,1099511627776,2199023255552,4398046511104,8796093022208,17592186044416,35184372088832,70368744177664,140737488355328,281474976710656,562949953421312,1125899906842624,2251799813685248,4503599627370496,9007199254740992,18014398509481984,36028797018963970,72057594037927940,144115188075855870,288230376151711740,576460752303423500,1152921504606847000,2305843009213694000,4611686018427388000,9223372036854776000}'::float8[])[(((1043 - ((((int8(float8send(k_w)) >> 32)::int) >> 20) & 2047)) + 1022) & 63) + 1])) * (('{2.2250738585072014e-308,4.1045368012983762e-289,7.571533991467358e-270,1.3967014978599092e-250,2.5764595078388533e-231,4.7527289157379e-212,8.767237396033612e-193,1.617269844780878e-173,2.983336292480083e-154,5.503284107318959e-135,1.0151767349262597e-115,1.8726705418768793e-96,3.454467422037778e-77,6.372367644529809e-58,1.1754943508222875e-38,2.168404344971009e-19,4,73786976294838210000,1.361129467683754e+39,2.5108406941546723e+58,4.631683569492648e+77,8.54394814368364e+96,1.5760802478557792e+116,2.9073548971824276e+135,5.363123171977039e+154,9.893216058924181e+173,1.824976247048878e+193,3.366486976990959e+212,6.210072369202836e+231,1.1455561567389984e+251,2.113178124542661e+270,3.89812560456e+289}'::float8[])[(((((((int8(float8send(k_w)) >> 32)::int) >> 20) & 2047) - 1043) + 1022) >> 6) + 1] * ('{1,2,4,8,16,32,64,128,256,512,1024,2048,4096,8192,16384,32768,65536,131072,262144,524288,1048576,2097152,4194304,8388608,16777216,33554432,67108864,134217728,268435456,536870912,1073741824,2147483648,4294967296,8589934592,17179869184,34359738368,68719476736,137438953472,274877906944,549755813888,1099511627776,2199023255552,4398046511104,8796093022208,17592186044416,35184372088832,70368744177664,140737488355328,281474976710656,562949953421312,1125899906842624,2251799813685248,4503599627370496,9007199254740992,18014398509481984,36028797018963970,72057594037927940,144115188075855870,288230376151711740,576460752303423500,1152921504606847000,2305843009213694000,4611686018427388000,9223372036854776000}'::float8[])[(((((((int8(float8send(k_w)) >> 32)::int) >> 20) & 2047) - 1043) + 1022) & 63) + 1]));
      k_v := k_r - (k_z - k_x);
      k_a := -1 / k_w;
      k_t := (trunc((k_a) * (('{2.2250738585072014e-308,4.1045368012983762e-289,7.571533991467358e-270,1.3967014978599092e-250,2.5764595078388533e-231,4.7527289157379e-212,8.767237396033612e-193,1.617269844780878e-173,2.983336292480083e-154,5.503284107318959e-135,1.0151767349262597e-115,1.8726705418768793e-96,3.454467422037778e-77,6.372367644529809e-58,1.1754943508222875e-38,2.168404344971009e-19,4,73786976294838210000,1.361129467683754e+39,2.5108406941546723e+58,4.631683569492648e+77,8.54394814368364e+96,1.5760802478557792e+116,2.9073548971824276e+135,5.363123171977039e+154,9.893216058924181e+173,1.824976247048878e+193,3.366486976990959e+212,6.210072369202836e+231,1.1455561567389984e+251,2.113178124542661e+270,3.89812560456e+289}'::float8[])[(((1043 - ((((int8(float8send(k_a)) >> 32)::int) >> 20) & 2047)) + 1022) >> 6) + 1] * ('{1,2,4,8,16,32,64,128,256,512,1024,2048,4096,8192,16384,32768,65536,131072,262144,524288,1048576,2097152,4194304,8388608,16777216,33554432,67108864,134217728,268435456,536870912,1073741824,2147483648,4294967296,8589934592,17179869184,34359738368,68719476736,137438953472,274877906944,549755813888,1099511627776,2199023255552,4398046511104,8796093022208,17592186044416,35184372088832,70368744177664,140737488355328,281474976710656,562949953421312,1125899906842624,2251799813685248,4503599627370496,9007199254740992,18014398509481984,36028797018963970,72057594037927940,144115188075855870,288230376151711740,576460752303423500,1152921504606847000,2305843009213694000,4611686018427388000,9223372036854776000}'::float8[])[(((1043 - ((((int8(float8send(k_a)) >> 32)::int) >> 20) & 2047)) + 1022) & 63) + 1])) * (('{2.2250738585072014e-308,4.1045368012983762e-289,7.571533991467358e-270,1.3967014978599092e-250,2.5764595078388533e-231,4.7527289157379e-212,8.767237396033612e-193,1.617269844780878e-173,2.983336292480083e-154,5.503284107318959e-135,1.0151767349262597e-115,1.8726705418768793e-96,3.454467422037778e-77,6.372367644529809e-58,1.1754943508222875e-38,2.168404344971009e-19,4,73786976294838210000,1.361129467683754e+39,2.5108406941546723e+58,4.631683569492648e+77,8.54394814368364e+96,1.5760802478557792e+116,2.9073548971824276e+135,5.363123171977039e+154,9.893216058924181e+173,1.824976247048878e+193,3.366486976990959e+212,6.210072369202836e+231,1.1455561567389984e+251,2.113178124542661e+270,3.89812560456e+289}'::float8[])[(((((((int8(float8send(k_a)) >> 32)::int) >> 20) & 2047) - 1043) + 1022) >> 6) + 1] * ('{1,2,4,8,16,32,64,128,256,512,1024,2048,4096,8192,16384,32768,65536,131072,262144,524288,1048576,2097152,4194304,8388608,16777216,33554432,67108864,134217728,268435456,536870912,1073741824,2147483648,4294967296,8589934592,17179869184,34359738368,68719476736,137438953472,274877906944,549755813888,1099511627776,2199023255552,4398046511104,8796093022208,17592186044416,35184372088832,70368744177664,140737488355328,281474976710656,562949953421312,1125899906842624,2251799813685248,4503599627370496,9007199254740992,18014398509481984,36028797018963970,72057594037927940,144115188075855870,288230376151711740,576460752303423500,1152921504606847000,2305843009213694000,4611686018427388000,9223372036854776000}'::float8[])[(((((((int8(float8send(k_a)) >> 32)::int) >> 20) & 2047) - 1043) + 1022) & 63) + 1]));
      if abs(k_t) >= 1e-144 and abs(k_t) <= 1e144 and abs(k_z) >= 1e-144 and abs(k_z) <= 1e144 and abs((1)::float8) <= 1e288 then
        f_p := k_t * k_z;
        f_ah := (k_t * 134217729 - (k_t * 134217729 - k_t));
        f_bh := (k_z * 134217729 - (k_z * 134217729 - k_z));
        f_e := (k_t - f_ah) * (k_z - f_bh) - (((f_p - f_ah * f_bh) - (k_t - f_ah) * f_bh) - f_ah * (k_z - f_bh));
        f_s := (1)::float8 + f_p;
        f_tl := ((1)::float8 - (f_s - (f_s - (1)::float8))) + (f_p - (f_s - (1)::float8));
        f_w := (f_tl - ((f_tl + f_e) - ((f_tl + f_e) - f_tl))) + (f_e - ((f_tl + f_e) - f_tl));
        k_s := f_s + (f_tl + f_e);
        if f_w <> 0 and ((f_s - (k_s - (k_s - f_s))) + ((f_tl + f_e) - (k_s - f_s))) <> 0 and (k_s + 2 * ((f_s - (k_s - (k_s - f_s))) + ((f_tl + f_e) - (k_s - f_s)))) - k_s = 2 * ((f_s - (k_s - (k_s - f_s))) + ((f_tl + f_e) - (k_s - f_s))) and (f_w < 0) = (((f_s - (k_s - (k_s - f_s))) + ((f_tl + f_e) - (k_s - f_s))) < 0) then k_s := k_s + 2 * ((f_s - (k_s - (k_s - f_s))) + ((f_tl + f_e) - (k_s - f_s))); end if;
      elsif k_t = 0 or k_z = 0 then
        k_s := k_t * k_z + (1)::float8;
      else
        k_s := fdlibm_fma_wide(a => k_t, b => k_z, c => (1)::float8);
      end if;
      if abs(k_t) >= 1e-144 and abs(k_t) <= 1e144 and abs(k_v) >= 1e-144 and abs(k_v) <= 1e144 and abs(k_s) <= 1e288 then
        f_p := k_t * k_v;
        f_ah := (k_t * 134217729 - (k_t * 134217729 - k_t));
        f_bh := (k_v * 134217729 - (k_v * 134217729 - k_v));
        f_e := (k_t - f_ah) * (k_v - f_bh) - (((f_p - f_ah * f_bh) - (k_t - f_ah) * f_bh) - f_ah * (k_v - f_bh));
        f_s := k_s + f_p;
        f_tl := (k_s - (f_s - (f_s - k_s))) + (f_p - (f_s - k_s));
        f_w := (f_tl - ((f_tl + f_e) - ((f_tl + f_e) - f_tl))) + (f_e - ((f_tl + f_e) - f_tl));
        k_u := f_s + (f_tl + f_e);
        if f_w <> 0 and ((f_s - (k_u - (k_u - f_s))) + ((f_tl + f_e) - (k_u - f_s))) <> 0 and (k_u + 2 * ((f_s - (k_u - (k_u - f_s))) + ((f_tl + f_e) - (k_u - f_s)))) - k_u = 2 * ((f_s - (k_u - (k_u - f_s))) + ((f_tl + f_e) - (k_u - f_s))) and (f_w < 0) = (((f_s - (k_u - (k_u - f_s))) + ((f_tl + f_e) - (k_u - f_s))) < 0) then k_u := k_u + 2 * ((f_s - (k_u - (k_u - f_s))) + ((f_tl + f_e) - (k_u - f_s))); end if;
      elsif k_t = 0 or k_v = 0 then
        k_u := k_t * k_v + k_s;
      else
        k_u := fdlibm_fma_wide(a => k_t, b => k_v, c => k_s);
      end if;
      if abs(k_a) >= 1e-144 and abs(k_a) <= 1e144 and abs(k_u) >= 1e-144 and abs(k_u) <= 1e144 and abs(k_t) <= 1e288 then
        f_p := k_a * k_u;
        f_ah := (k_a * 134217729 - (k_a * 134217729 - k_a));
        f_bh := (k_u * 134217729 - (k_u * 134217729 - k_u));
        f_e := (k_a - f_ah) * (k_u - f_bh) - (((f_p - f_ah * f_bh) - (k_a - f_ah) * f_bh) - f_ah * (k_u - f_bh));
        f_s := k_t + f_p;
        f_tl := (k_t - (f_s - (f_s - k_t))) + (f_p - (f_s - k_t));
        f_w := (f_tl - ((f_tl + f_e) - ((f_tl + f_e) - f_tl))) + (f_e - ((f_tl + f_e) - f_tl));
        res := f_s + (f_tl + f_e);
        if f_w <> 0 and ((f_s - (res - (res - f_s))) + ((f_tl + f_e) - (res - f_s))) <> 0 and (res + 2 * ((f_s - (res - (res - f_s))) + ((f_tl + f_e) - (res - f_s)))) - res = 2 * ((f_s - (res - (res - f_s))) + ((f_tl + f_e) - (res - f_s))) and (f_w < 0) = (((f_s - (res - (res - f_s))) + ((f_tl + f_e) - (res - f_s))) < 0) then res := res + 2 * ((f_s - (res - (res - f_s))) + ((f_tl + f_e) - (res - f_s))); end if;
      elsif k_a = 0 or k_u = 0 then
        res := k_a * k_u + k_t;
      else
        res := fdlibm_fma_wide(a => k_a, b => k_u, c => k_t);
      end if;
    end if;
  end if;

    return res;
  end if;
  if (n & 1) = (case when 0 = 0 then 0 else 1 end) then
  k_ix := (int8(float8send(y0)) >> 32)::int & 2147483647;
  if k_ix < 0x3E400000 then
    res := y0;
  else
    k_z := y0 * y0;
    k_v := k_z * y0;
    if abs(k_z) >= 1e-144 and abs(k_z) <= 1e144 and abs((1.58969099521155010221e-10)::float8) >= 1e-144 and abs((1.58969099521155010221e-10)::float8) <= 1e144 and abs((-2.50507602534068634195e-08)::float8) <= 1e288 then
      f_p := k_z * (1.58969099521155010221e-10)::float8;
      f_ah := (k_z * 134217729 - (k_z * 134217729 - k_z));
      f_e := (k_z - f_ah) * ((1.58969099521155010221e-10)::float8 - ((1.58969099521155010221e-10)::float8 * 134217729 - ((1.58969099521155010221e-10)::float8 * 134217729 - (1.58969099521155010221e-10)::float8))) - (((f_p - f_ah * ((1.58969099521155010221e-10)::float8 * 134217729 - ((1.58969099521155010221e-10)::float8 * 134217729 - (1.58969099521155010221e-10)::float8))) - (k_z - f_ah) * ((1.58969099521155010221e-10)::float8 * 134217729 - ((1.58969099521155010221e-10)::float8 * 134217729 - (1.58969099521155010221e-10)::float8))) - f_ah * ((1.58969099521155010221e-10)::float8 - ((1.58969099521155010221e-10)::float8 * 134217729 - ((1.58969099521155010221e-10)::float8 * 134217729 - (1.58969099521155010221e-10)::float8))));
      f_s := (-2.50507602534068634195e-08)::float8 + f_p;
      f_tl := ((-2.50507602534068634195e-08)::float8 - (f_s - (f_s - (-2.50507602534068634195e-08)::float8))) + (f_p - (f_s - (-2.50507602534068634195e-08)::float8));
      f_w := (f_tl - ((f_tl + f_e) - ((f_tl + f_e) - f_tl))) + (f_e - ((f_tl + f_e) - f_tl));
      k_r := f_s + (f_tl + f_e);
      if f_w <> 0 and ((f_s - (k_r - (k_r - f_s))) + ((f_tl + f_e) - (k_r - f_s))) <> 0 and (k_r + 2 * ((f_s - (k_r - (k_r - f_s))) + ((f_tl + f_e) - (k_r - f_s)))) - k_r = 2 * ((f_s - (k_r - (k_r - f_s))) + ((f_tl + f_e) - (k_r - f_s))) and (f_w < 0) = (((f_s - (k_r - (k_r - f_s))) + ((f_tl + f_e) - (k_r - f_s))) < 0) then k_r := k_r + 2 * ((f_s - (k_r - (k_r - f_s))) + ((f_tl + f_e) - (k_r - f_s))); end if;
    elsif k_z = 0 or (1.58969099521155010221e-10)::float8 = 0 then
      k_r := k_z * (1.58969099521155010221e-10)::float8 + (-2.50507602534068634195e-08)::float8;
    else
      k_r := fdlibm_fma_wide(a => k_z, b => (1.58969099521155010221e-10)::float8, c => (-2.50507602534068634195e-08)::float8);
    end if;
    if abs(k_z) >= 1e-144 and abs(k_z) <= 1e144 and abs(k_r) >= 1e-144 and abs(k_r) <= 1e144 and abs((2.75573137070700676789e-06)::float8) <= 1e288 then
      f_p := k_z * k_r;
      f_ah := (k_z * 134217729 - (k_z * 134217729 - k_z));
      f_bh := (k_r * 134217729 - (k_r * 134217729 - k_r));
      f_e := (k_z - f_ah) * (k_r - f_bh) - (((f_p - f_ah * f_bh) - (k_z - f_ah) * f_bh) - f_ah * (k_r - f_bh));
      f_s := (2.75573137070700676789e-06)::float8 + f_p;
      f_tl := ((2.75573137070700676789e-06)::float8 - (f_s - (f_s - (2.75573137070700676789e-06)::float8))) + (f_p - (f_s - (2.75573137070700676789e-06)::float8));
      f_w := (f_tl - ((f_tl + f_e) - ((f_tl + f_e) - f_tl))) + (f_e - ((f_tl + f_e) - f_tl));
      k_r := f_s + (f_tl + f_e);
      if f_w <> 0 and ((f_s - (k_r - (k_r - f_s))) + ((f_tl + f_e) - (k_r - f_s))) <> 0 and (k_r + 2 * ((f_s - (k_r - (k_r - f_s))) + ((f_tl + f_e) - (k_r - f_s)))) - k_r = 2 * ((f_s - (k_r - (k_r - f_s))) + ((f_tl + f_e) - (k_r - f_s))) and (f_w < 0) = (((f_s - (k_r - (k_r - f_s))) + ((f_tl + f_e) - (k_r - f_s))) < 0) then k_r := k_r + 2 * ((f_s - (k_r - (k_r - f_s))) + ((f_tl + f_e) - (k_r - f_s))); end if;
    elsif k_z = 0 or k_r = 0 then
      k_r := k_z * k_r + (2.75573137070700676789e-06)::float8;
    else
      k_r := fdlibm_fma_wide(a => k_z, b => k_r, c => (2.75573137070700676789e-06)::float8);
    end if;
    if abs(k_z) >= 1e-144 and abs(k_z) <= 1e144 and abs(k_r) >= 1e-144 and abs(k_r) <= 1e144 and abs((-1.98412698298579493134e-04)::float8) <= 1e288 then
      f_p := k_z * k_r;
      f_ah := (k_z * 134217729 - (k_z * 134217729 - k_z));
      f_bh := (k_r * 134217729 - (k_r * 134217729 - k_r));
      f_e := (k_z - f_ah) * (k_r - f_bh) - (((f_p - f_ah * f_bh) - (k_z - f_ah) * f_bh) - f_ah * (k_r - f_bh));
      f_s := (-1.98412698298579493134e-04)::float8 + f_p;
      f_tl := ((-1.98412698298579493134e-04)::float8 - (f_s - (f_s - (-1.98412698298579493134e-04)::float8))) + (f_p - (f_s - (-1.98412698298579493134e-04)::float8));
      f_w := (f_tl - ((f_tl + f_e) - ((f_tl + f_e) - f_tl))) + (f_e - ((f_tl + f_e) - f_tl));
      k_r := f_s + (f_tl + f_e);
      if f_w <> 0 and ((f_s - (k_r - (k_r - f_s))) + ((f_tl + f_e) - (k_r - f_s))) <> 0 and (k_r + 2 * ((f_s - (k_r - (k_r - f_s))) + ((f_tl + f_e) - (k_r - f_s)))) - k_r = 2 * ((f_s - (k_r - (k_r - f_s))) + ((f_tl + f_e) - (k_r - f_s))) and (f_w < 0) = (((f_s - (k_r - (k_r - f_s))) + ((f_tl + f_e) - (k_r - f_s))) < 0) then k_r := k_r + 2 * ((f_s - (k_r - (k_r - f_s))) + ((f_tl + f_e) - (k_r - f_s))); end if;
    elsif k_z = 0 or k_r = 0 then
      k_r := k_z * k_r + (-1.98412698298579493134e-04)::float8;
    else
      k_r := fdlibm_fma_wide(a => k_z, b => k_r, c => (-1.98412698298579493134e-04)::float8);
    end if;
    if abs(k_z) >= 1e-144 and abs(k_z) <= 1e144 and abs(k_r) >= 1e-144 and abs(k_r) <= 1e144 and abs((8.33333333332248946124e-03)::float8) <= 1e288 then
      f_p := k_z * k_r;
      f_ah := (k_z * 134217729 - (k_z * 134217729 - k_z));
      f_bh := (k_r * 134217729 - (k_r * 134217729 - k_r));
      f_e := (k_z - f_ah) * (k_r - f_bh) - (((f_p - f_ah * f_bh) - (k_z - f_ah) * f_bh) - f_ah * (k_r - f_bh));
      f_s := (8.33333333332248946124e-03)::float8 + f_p;
      f_tl := ((8.33333333332248946124e-03)::float8 - (f_s - (f_s - (8.33333333332248946124e-03)::float8))) + (f_p - (f_s - (8.33333333332248946124e-03)::float8));
      f_w := (f_tl - ((f_tl + f_e) - ((f_tl + f_e) - f_tl))) + (f_e - ((f_tl + f_e) - f_tl));
      k_r := f_s + (f_tl + f_e);
      if f_w <> 0 and ((f_s - (k_r - (k_r - f_s))) + ((f_tl + f_e) - (k_r - f_s))) <> 0 and (k_r + 2 * ((f_s - (k_r - (k_r - f_s))) + ((f_tl + f_e) - (k_r - f_s)))) - k_r = 2 * ((f_s - (k_r - (k_r - f_s))) + ((f_tl + f_e) - (k_r - f_s))) and (f_w < 0) = (((f_s - (k_r - (k_r - f_s))) + ((f_tl + f_e) - (k_r - f_s))) < 0) then k_r := k_r + 2 * ((f_s - (k_r - (k_r - f_s))) + ((f_tl + f_e) - (k_r - f_s))); end if;
    elsif k_z = 0 or k_r = 0 then
      k_r := k_z * k_r + (8.33333333332248946124e-03)::float8;
    else
      k_r := fdlibm_fma_wide(a => k_z, b => k_r, c => (8.33333333332248946124e-03)::float8);
    end if;
    if kiy = 0 then
      if abs(k_z) >= 1e-144 and abs(k_z) <= 1e144 and abs(k_r) >= 1e-144 and abs(k_r) <= 1e144 and abs((-1.66666666666666324348e-01)::float8) <= 1e288 then
        f_p := k_z * k_r;
        f_ah := (k_z * 134217729 - (k_z * 134217729 - k_z));
        f_bh := (k_r * 134217729 - (k_r * 134217729 - k_r));
        f_e := (k_z - f_ah) * (k_r - f_bh) - (((f_p - f_ah * f_bh) - (k_z - f_ah) * f_bh) - f_ah * (k_r - f_bh));
        f_s := (-1.66666666666666324348e-01)::float8 + f_p;
        f_tl := ((-1.66666666666666324348e-01)::float8 - (f_s - (f_s - (-1.66666666666666324348e-01)::float8))) + (f_p - (f_s - (-1.66666666666666324348e-01)::float8));
        f_w := (f_tl - ((f_tl + f_e) - ((f_tl + f_e) - f_tl))) + (f_e - ((f_tl + f_e) - f_tl));
        k_u := f_s + (f_tl + f_e);
        if f_w <> 0 and ((f_s - (k_u - (k_u - f_s))) + ((f_tl + f_e) - (k_u - f_s))) <> 0 and (k_u + 2 * ((f_s - (k_u - (k_u - f_s))) + ((f_tl + f_e) - (k_u - f_s)))) - k_u = 2 * ((f_s - (k_u - (k_u - f_s))) + ((f_tl + f_e) - (k_u - f_s))) and (f_w < 0) = (((f_s - (k_u - (k_u - f_s))) + ((f_tl + f_e) - (k_u - f_s))) < 0) then k_u := k_u + 2 * ((f_s - (k_u - (k_u - f_s))) + ((f_tl + f_e) - (k_u - f_s))); end if;
      elsif k_z = 0 or k_r = 0 then
        k_u := k_z * k_r + (-1.66666666666666324348e-01)::float8;
      else
        k_u := fdlibm_fma_wide(a => k_z, b => k_r, c => (-1.66666666666666324348e-01)::float8);
      end if;
      if abs(k_v) >= 1e-144 and abs(k_v) <= 1e144 and abs(k_u) >= 1e-144 and abs(k_u) <= 1e144 and abs(y0) <= 1e288 then
        f_p := k_v * k_u;
        f_ah := (k_v * 134217729 - (k_v * 134217729 - k_v));
        f_bh := (k_u * 134217729 - (k_u * 134217729 - k_u));
        f_e := (k_v - f_ah) * (k_u - f_bh) - (((f_p - f_ah * f_bh) - (k_v - f_ah) * f_bh) - f_ah * (k_u - f_bh));
        f_s := y0 + f_p;
        f_tl := (y0 - (f_s - (f_s - y0))) + (f_p - (f_s - y0));
        f_w := (f_tl - ((f_tl + f_e) - ((f_tl + f_e) - f_tl))) + (f_e - ((f_tl + f_e) - f_tl));
        res := f_s + (f_tl + f_e);
        if f_w <> 0 and ((f_s - (res - (res - f_s))) + ((f_tl + f_e) - (res - f_s))) <> 0 and (res + 2 * ((f_s - (res - (res - f_s))) + ((f_tl + f_e) - (res - f_s)))) - res = 2 * ((f_s - (res - (res - f_s))) + ((f_tl + f_e) - (res - f_s))) and (f_w < 0) = (((f_s - (res - (res - f_s))) + ((f_tl + f_e) - (res - f_s))) < 0) then res := res + 2 * ((f_s - (res - (res - f_s))) + ((f_tl + f_e) - (res - f_s))); end if;
      elsif k_v = 0 or k_u = 0 then
        res := k_v * k_u + y0;
      else
        res := fdlibm_fma_wide(a => k_v, b => k_u, c => y0);
      end if;
    else
      if abs(k_z) >= 1e-144 and abs(k_z) <= 1e144 and abs((0.5 * y1 - k_v * k_r)::float8) >= 1e-144 and abs((0.5 * y1 - k_v * k_r)::float8) <= 1e144 and abs(-y1) <= 1e288 then
        f_p := k_z * (0.5 * y1 - k_v * k_r)::float8;
        f_ah := (k_z * 134217729 - (k_z * 134217729 - k_z));
        f_e := (k_z - f_ah) * ((0.5 * y1 - k_v * k_r)::float8 - ((0.5 * y1 - k_v * k_r)::float8 * 134217729 - ((0.5 * y1 - k_v * k_r)::float8 * 134217729 - (0.5 * y1 - k_v * k_r)::float8))) - (((f_p - f_ah * ((0.5 * y1 - k_v * k_r)::float8 * 134217729 - ((0.5 * y1 - k_v * k_r)::float8 * 134217729 - (0.5 * y1 - k_v * k_r)::float8))) - (k_z - f_ah) * ((0.5 * y1 - k_v * k_r)::float8 * 134217729 - ((0.5 * y1 - k_v * k_r)::float8 * 134217729 - (0.5 * y1 - k_v * k_r)::float8))) - f_ah * ((0.5 * y1 - k_v * k_r)::float8 - ((0.5 * y1 - k_v * k_r)::float8 * 134217729 - ((0.5 * y1 - k_v * k_r)::float8 * 134217729 - (0.5 * y1 - k_v * k_r)::float8))));
        f_s := -y1 + f_p;
        f_tl := (-y1 - (f_s - (f_s - -y1))) + (f_p - (f_s - -y1));
        f_w := (f_tl - ((f_tl + f_e) - ((f_tl + f_e) - f_tl))) + (f_e - ((f_tl + f_e) - f_tl));
        k_u := f_s + (f_tl + f_e);
        if f_w <> 0 and ((f_s - (k_u - (k_u - f_s))) + ((f_tl + f_e) - (k_u - f_s))) <> 0 and (k_u + 2 * ((f_s - (k_u - (k_u - f_s))) + ((f_tl + f_e) - (k_u - f_s)))) - k_u = 2 * ((f_s - (k_u - (k_u - f_s))) + ((f_tl + f_e) - (k_u - f_s))) and (f_w < 0) = (((f_s - (k_u - (k_u - f_s))) + ((f_tl + f_e) - (k_u - f_s))) < 0) then k_u := k_u + 2 * ((f_s - (k_u - (k_u - f_s))) + ((f_tl + f_e) - (k_u - f_s))); end if;
      elsif k_z = 0 or (0.5 * y1 - k_v * k_r)::float8 = 0 then
        k_u := k_z * (0.5 * y1 - k_v * k_r)::float8 + -y1;
      else
        k_u := fdlibm_fma_wide(a => k_z, b => (0.5 * y1 - k_v * k_r)::float8, c => -y1);
      end if;
      if abs(-k_v) >= 1e-144 and abs(-k_v) <= 1e144 and abs((-1.66666666666666324348e-01)::float8) >= 1e-144 and abs((-1.66666666666666324348e-01)::float8) <= 1e144 and abs(k_u) <= 1e288 then
        f_p := -k_v * (-1.66666666666666324348e-01)::float8;
        f_ah := (-k_v * 134217729 - (-k_v * 134217729 - -k_v));
        f_e := (-k_v - f_ah) * ((-1.66666666666666324348e-01)::float8 - ((-1.66666666666666324348e-01)::float8 * 134217729 - ((-1.66666666666666324348e-01)::float8 * 134217729 - (-1.66666666666666324348e-01)::float8))) - (((f_p - f_ah * ((-1.66666666666666324348e-01)::float8 * 134217729 - ((-1.66666666666666324348e-01)::float8 * 134217729 - (-1.66666666666666324348e-01)::float8))) - (-k_v - f_ah) * ((-1.66666666666666324348e-01)::float8 * 134217729 - ((-1.66666666666666324348e-01)::float8 * 134217729 - (-1.66666666666666324348e-01)::float8))) - f_ah * ((-1.66666666666666324348e-01)::float8 - ((-1.66666666666666324348e-01)::float8 * 134217729 - ((-1.66666666666666324348e-01)::float8 * 134217729 - (-1.66666666666666324348e-01)::float8))));
        f_s := k_u + f_p;
        f_tl := (k_u - (f_s - (f_s - k_u))) + (f_p - (f_s - k_u));
        f_w := (f_tl - ((f_tl + f_e) - ((f_tl + f_e) - f_tl))) + (f_e - ((f_tl + f_e) - f_tl));
        k_u := f_s + (f_tl + f_e);
        if f_w <> 0 and ((f_s - (k_u - (k_u - f_s))) + ((f_tl + f_e) - (k_u - f_s))) <> 0 and (k_u + 2 * ((f_s - (k_u - (k_u - f_s))) + ((f_tl + f_e) - (k_u - f_s)))) - k_u = 2 * ((f_s - (k_u - (k_u - f_s))) + ((f_tl + f_e) - (k_u - f_s))) and (f_w < 0) = (((f_s - (k_u - (k_u - f_s))) + ((f_tl + f_e) - (k_u - f_s))) < 0) then k_u := k_u + 2 * ((f_s - (k_u - (k_u - f_s))) + ((f_tl + f_e) - (k_u - f_s))); end if;
      elsif -k_v = 0 or (-1.66666666666666324348e-01)::float8 = 0 then
        k_u := -k_v * (-1.66666666666666324348e-01)::float8 + k_u;
      else
        k_u := fdlibm_fma_wide(a => -k_v, b => (-1.66666666666666324348e-01)::float8, c => k_u);
      end if;
      res := y0 - k_u;
    end if;
  end if;

  else
  k_ix := (int8(float8send(y0)) >> 32)::int & 2147483647;
  if k_ix < 0x3E400000 then
    res := 1;
  else
    k_z := y0 * y0;
    if abs(k_z) >= 1e-144 and abs(k_z) <= 1e144 and abs((-1.13596475577881948265e-11)::float8) >= 1e-144 and abs((-1.13596475577881948265e-11)::float8) <= 1e144 and abs((2.08757232129817482790e-09)::float8) <= 1e288 then
      f_p := k_z * (-1.13596475577881948265e-11)::float8;
      f_ah := (k_z * 134217729 - (k_z * 134217729 - k_z));
      f_e := (k_z - f_ah) * ((-1.13596475577881948265e-11)::float8 - ((-1.13596475577881948265e-11)::float8 * 134217729 - ((-1.13596475577881948265e-11)::float8 * 134217729 - (-1.13596475577881948265e-11)::float8))) - (((f_p - f_ah * ((-1.13596475577881948265e-11)::float8 * 134217729 - ((-1.13596475577881948265e-11)::float8 * 134217729 - (-1.13596475577881948265e-11)::float8))) - (k_z - f_ah) * ((-1.13596475577881948265e-11)::float8 * 134217729 - ((-1.13596475577881948265e-11)::float8 * 134217729 - (-1.13596475577881948265e-11)::float8))) - f_ah * ((-1.13596475577881948265e-11)::float8 - ((-1.13596475577881948265e-11)::float8 * 134217729 - ((-1.13596475577881948265e-11)::float8 * 134217729 - (-1.13596475577881948265e-11)::float8))));
      f_s := (2.08757232129817482790e-09)::float8 + f_p;
      f_tl := ((2.08757232129817482790e-09)::float8 - (f_s - (f_s - (2.08757232129817482790e-09)::float8))) + (f_p - (f_s - (2.08757232129817482790e-09)::float8));
      f_w := (f_tl - ((f_tl + f_e) - ((f_tl + f_e) - f_tl))) + (f_e - ((f_tl + f_e) - f_tl));
      k_r := f_s + (f_tl + f_e);
      if f_w <> 0 and ((f_s - (k_r - (k_r - f_s))) + ((f_tl + f_e) - (k_r - f_s))) <> 0 and (k_r + 2 * ((f_s - (k_r - (k_r - f_s))) + ((f_tl + f_e) - (k_r - f_s)))) - k_r = 2 * ((f_s - (k_r - (k_r - f_s))) + ((f_tl + f_e) - (k_r - f_s))) and (f_w < 0) = (((f_s - (k_r - (k_r - f_s))) + ((f_tl + f_e) - (k_r - f_s))) < 0) then k_r := k_r + 2 * ((f_s - (k_r - (k_r - f_s))) + ((f_tl + f_e) - (k_r - f_s))); end if;
    elsif k_z = 0 or (-1.13596475577881948265e-11)::float8 = 0 then
      k_r := k_z * (-1.13596475577881948265e-11)::float8 + (2.08757232129817482790e-09)::float8;
    else
      k_r := fdlibm_fma_wide(a => k_z, b => (-1.13596475577881948265e-11)::float8, c => (2.08757232129817482790e-09)::float8);
    end if;
    if abs(k_z) >= 1e-144 and abs(k_z) <= 1e144 and abs(k_r) >= 1e-144 and abs(k_r) <= 1e144 and abs((-2.75573143513906633035e-07)::float8) <= 1e288 then
      f_p := k_z * k_r;
      f_ah := (k_z * 134217729 - (k_z * 134217729 - k_z));
      f_bh := (k_r * 134217729 - (k_r * 134217729 - k_r));
      f_e := (k_z - f_ah) * (k_r - f_bh) - (((f_p - f_ah * f_bh) - (k_z - f_ah) * f_bh) - f_ah * (k_r - f_bh));
      f_s := (-2.75573143513906633035e-07)::float8 + f_p;
      f_tl := ((-2.75573143513906633035e-07)::float8 - (f_s - (f_s - (-2.75573143513906633035e-07)::float8))) + (f_p - (f_s - (-2.75573143513906633035e-07)::float8));
      f_w := (f_tl - ((f_tl + f_e) - ((f_tl + f_e) - f_tl))) + (f_e - ((f_tl + f_e) - f_tl));
      k_r := f_s + (f_tl + f_e);
      if f_w <> 0 and ((f_s - (k_r - (k_r - f_s))) + ((f_tl + f_e) - (k_r - f_s))) <> 0 and (k_r + 2 * ((f_s - (k_r - (k_r - f_s))) + ((f_tl + f_e) - (k_r - f_s)))) - k_r = 2 * ((f_s - (k_r - (k_r - f_s))) + ((f_tl + f_e) - (k_r - f_s))) and (f_w < 0) = (((f_s - (k_r - (k_r - f_s))) + ((f_tl + f_e) - (k_r - f_s))) < 0) then k_r := k_r + 2 * ((f_s - (k_r - (k_r - f_s))) + ((f_tl + f_e) - (k_r - f_s))); end if;
    elsif k_z = 0 or k_r = 0 then
      k_r := k_z * k_r + (-2.75573143513906633035e-07)::float8;
    else
      k_r := fdlibm_fma_wide(a => k_z, b => k_r, c => (-2.75573143513906633035e-07)::float8);
    end if;
    if abs(k_z) >= 1e-144 and abs(k_z) <= 1e144 and abs(k_r) >= 1e-144 and abs(k_r) <= 1e144 and abs((2.48015872894767294178e-05)::float8) <= 1e288 then
      f_p := k_z * k_r;
      f_ah := (k_z * 134217729 - (k_z * 134217729 - k_z));
      f_bh := (k_r * 134217729 - (k_r * 134217729 - k_r));
      f_e := (k_z - f_ah) * (k_r - f_bh) - (((f_p - f_ah * f_bh) - (k_z - f_ah) * f_bh) - f_ah * (k_r - f_bh));
      f_s := (2.48015872894767294178e-05)::float8 + f_p;
      f_tl := ((2.48015872894767294178e-05)::float8 - (f_s - (f_s - (2.48015872894767294178e-05)::float8))) + (f_p - (f_s - (2.48015872894767294178e-05)::float8));
      f_w := (f_tl - ((f_tl + f_e) - ((f_tl + f_e) - f_tl))) + (f_e - ((f_tl + f_e) - f_tl));
      k_r := f_s + (f_tl + f_e);
      if f_w <> 0 and ((f_s - (k_r - (k_r - f_s))) + ((f_tl + f_e) - (k_r - f_s))) <> 0 and (k_r + 2 * ((f_s - (k_r - (k_r - f_s))) + ((f_tl + f_e) - (k_r - f_s)))) - k_r = 2 * ((f_s - (k_r - (k_r - f_s))) + ((f_tl + f_e) - (k_r - f_s))) and (f_w < 0) = (((f_s - (k_r - (k_r - f_s))) + ((f_tl + f_e) - (k_r - f_s))) < 0) then k_r := k_r + 2 * ((f_s - (k_r - (k_r - f_s))) + ((f_tl + f_e) - (k_r - f_s))); end if;
    elsif k_z = 0 or k_r = 0 then
      k_r := k_z * k_r + (2.48015872894767294178e-05)::float8;
    else
      k_r := fdlibm_fma_wide(a => k_z, b => k_r, c => (2.48015872894767294178e-05)::float8);
    end if;
    if abs(k_z) >= 1e-144 and abs(k_z) <= 1e144 and abs(k_r) >= 1e-144 and abs(k_r) <= 1e144 and abs((-1.38888888888741095749e-03)::float8) <= 1e288 then
      f_p := k_z * k_r;
      f_ah := (k_z * 134217729 - (k_z * 134217729 - k_z));
      f_bh := (k_r * 134217729 - (k_r * 134217729 - k_r));
      f_e := (k_z - f_ah) * (k_r - f_bh) - (((f_p - f_ah * f_bh) - (k_z - f_ah) * f_bh) - f_ah * (k_r - f_bh));
      f_s := (-1.38888888888741095749e-03)::float8 + f_p;
      f_tl := ((-1.38888888888741095749e-03)::float8 - (f_s - (f_s - (-1.38888888888741095749e-03)::float8))) + (f_p - (f_s - (-1.38888888888741095749e-03)::float8));
      f_w := (f_tl - ((f_tl + f_e) - ((f_tl + f_e) - f_tl))) + (f_e - ((f_tl + f_e) - f_tl));
      k_r := f_s + (f_tl + f_e);
      if f_w <> 0 and ((f_s - (k_r - (k_r - f_s))) + ((f_tl + f_e) - (k_r - f_s))) <> 0 and (k_r + 2 * ((f_s - (k_r - (k_r - f_s))) + ((f_tl + f_e) - (k_r - f_s)))) - k_r = 2 * ((f_s - (k_r - (k_r - f_s))) + ((f_tl + f_e) - (k_r - f_s))) and (f_w < 0) = (((f_s - (k_r - (k_r - f_s))) + ((f_tl + f_e) - (k_r - f_s))) < 0) then k_r := k_r + 2 * ((f_s - (k_r - (k_r - f_s))) + ((f_tl + f_e) - (k_r - f_s))); end if;
    elsif k_z = 0 or k_r = 0 then
      k_r := k_z * k_r + (-1.38888888888741095749e-03)::float8;
    else
      k_r := fdlibm_fma_wide(a => k_z, b => k_r, c => (-1.38888888888741095749e-03)::float8);
    end if;
    if abs(k_z) >= 1e-144 and abs(k_z) <= 1e144 and abs(k_r) >= 1e-144 and abs(k_r) <= 1e144 and abs((4.16666666666666019037e-02)::float8) <= 1e288 then
      f_p := k_z * k_r;
      f_ah := (k_z * 134217729 - (k_z * 134217729 - k_z));
      f_bh := (k_r * 134217729 - (k_r * 134217729 - k_r));
      f_e := (k_z - f_ah) * (k_r - f_bh) - (((f_p - f_ah * f_bh) - (k_z - f_ah) * f_bh) - f_ah * (k_r - f_bh));
      f_s := (4.16666666666666019037e-02)::float8 + f_p;
      f_tl := ((4.16666666666666019037e-02)::float8 - (f_s - (f_s - (4.16666666666666019037e-02)::float8))) + (f_p - (f_s - (4.16666666666666019037e-02)::float8));
      f_w := (f_tl - ((f_tl + f_e) - ((f_tl + f_e) - f_tl))) + (f_e - ((f_tl + f_e) - f_tl));
      k_r := f_s + (f_tl + f_e);
      if f_w <> 0 and ((f_s - (k_r - (k_r - f_s))) + ((f_tl + f_e) - (k_r - f_s))) <> 0 and (k_r + 2 * ((f_s - (k_r - (k_r - f_s))) + ((f_tl + f_e) - (k_r - f_s)))) - k_r = 2 * ((f_s - (k_r - (k_r - f_s))) + ((f_tl + f_e) - (k_r - f_s))) and (f_w < 0) = (((f_s - (k_r - (k_r - f_s))) + ((f_tl + f_e) - (k_r - f_s))) < 0) then k_r := k_r + 2 * ((f_s - (k_r - (k_r - f_s))) + ((f_tl + f_e) - (k_r - f_s))); end if;
    elsif k_z = 0 or k_r = 0 then
      k_r := k_z * k_r + (4.16666666666666019037e-02)::float8;
    else
      k_r := fdlibm_fma_wide(a => k_z, b => k_r, c => (4.16666666666666019037e-02)::float8);
    end if;
    k_r := k_z * k_r;
    f_c := -(y0 * y1);
    if abs(k_z) >= 1e-144 and abs(k_z) <= 1e144 and abs(k_r) >= 1e-144 and abs(k_r) <= 1e144 and abs(f_c) <= 1e288 then
      f_p := k_z * k_r;
      f_ah := (k_z * 134217729 - (k_z * 134217729 - k_z));
      f_bh := (k_r * 134217729 - (k_r * 134217729 - k_r));
      f_e := (k_z - f_ah) * (k_r - f_bh) - (((f_p - f_ah * f_bh) - (k_z - f_ah) * f_bh) - f_ah * (k_r - f_bh));
      f_s := f_c + f_p;
      f_tl := (f_c - (f_s - (f_s - f_c))) + (f_p - (f_s - f_c));
      f_w := (f_tl - ((f_tl + f_e) - ((f_tl + f_e) - f_tl))) + (f_e - ((f_tl + f_e) - f_tl));
      k_u := f_s + (f_tl + f_e);
      if f_w <> 0 and ((f_s - (k_u - (k_u - f_s))) + ((f_tl + f_e) - (k_u - f_s))) <> 0 and (k_u + 2 * ((f_s - (k_u - (k_u - f_s))) + ((f_tl + f_e) - (k_u - f_s)))) - k_u = 2 * ((f_s - (k_u - (k_u - f_s))) + ((f_tl + f_e) - (k_u - f_s))) and (f_w < 0) = (((f_s - (k_u - (k_u - f_s))) + ((f_tl + f_e) - (k_u - f_s))) < 0) then k_u := k_u + 2 * ((f_s - (k_u - (k_u - f_s))) + ((f_tl + f_e) - (k_u - f_s))); end if;
    elsif k_z = 0 or k_r = 0 then
      k_u := k_z * k_r + f_c;
    else
      k_u := fdlibm_fma_wide(a => k_z, b => k_r, c => f_c);
    end if;
    if k_ix < 0x3FD33333 then
      res := 1 - (0.5 * k_z - k_u);
    else
      k_q := case when k_ix > 0x3FE90000 then 0.28125 else (trunc((abs(y0)) * (('{2.2250738585072014e-308,4.1045368012983762e-289,7.571533991467358e-270,1.3967014978599092e-250,2.5764595078388533e-231,4.7527289157379e-212,8.767237396033612e-193,1.617269844780878e-173,2.983336292480083e-154,5.503284107318959e-135,1.0151767349262597e-115,1.8726705418768793e-96,3.454467422037778e-77,6.372367644529809e-58,1.1754943508222875e-38,2.168404344971009e-19,4,73786976294838210000,1.361129467683754e+39,2.5108406941546723e+58,4.631683569492648e+77,8.54394814368364e+96,1.5760802478557792e+116,2.9073548971824276e+135,5.363123171977039e+154,9.893216058924181e+173,1.824976247048878e+193,3.366486976990959e+212,6.210072369202836e+231,1.1455561567389984e+251,2.113178124542661e+270,3.89812560456e+289}'::float8[])[(((1043 - (((k_ix) >> 20) & 2047)) + 1022) >> 6) + 1] * ('{1,2,4,8,16,32,64,128,256,512,1024,2048,4096,8192,16384,32768,65536,131072,262144,524288,1048576,2097152,4194304,8388608,16777216,33554432,67108864,134217728,268435456,536870912,1073741824,2147483648,4294967296,8589934592,17179869184,34359738368,68719476736,137438953472,274877906944,549755813888,1099511627776,2199023255552,4398046511104,8796093022208,17592186044416,35184372088832,70368744177664,140737488355328,281474976710656,562949953421312,1125899906842624,2251799813685248,4503599627370496,9007199254740992,18014398509481984,36028797018963970,72057594037927940,144115188075855870,288230376151711740,576460752303423500,1152921504606847000,2305843009213694000,4611686018427388000,9223372036854776000}'::float8[])[(((1043 - (((k_ix) >> 20) & 2047)) + 1022) & 63) + 1])) * (('{2.2250738585072014e-308,4.1045368012983762e-289,7.571533991467358e-270,1.3967014978599092e-250,2.5764595078388533e-231,4.7527289157379e-212,8.767237396033612e-193,1.617269844780878e-173,2.983336292480083e-154,5.503284107318959e-135,1.0151767349262597e-115,1.8726705418768793e-96,3.454467422037778e-77,6.372367644529809e-58,1.1754943508222875e-38,2.168404344971009e-19,4,73786976294838210000,1.361129467683754e+39,2.5108406941546723e+58,4.631683569492648e+77,8.54394814368364e+96,1.5760802478557792e+116,2.9073548971824276e+135,5.363123171977039e+154,9.893216058924181e+173,1.824976247048878e+193,3.366486976990959e+212,6.210072369202836e+231,1.1455561567389984e+251,2.113178124542661e+270,3.89812560456e+289}'::float8[])[((((((k_ix) >> 20) & 2047) - 1043) + 1022) >> 6) + 1] * ('{1,2,4,8,16,32,64,128,256,512,1024,2048,4096,8192,16384,32768,65536,131072,262144,524288,1048576,2097152,4194304,8388608,16777216,33554432,67108864,134217728,268435456,536870912,1073741824,2147483648,4294967296,8589934592,17179869184,34359738368,68719476736,137438953472,274877906944,549755813888,1099511627776,2199023255552,4398046511104,8796093022208,17592186044416,35184372088832,70368744177664,140737488355328,281474976710656,562949953421312,1125899906842624,2251799813685248,4503599627370496,9007199254740992,18014398509481984,36028797018963970,72057594037927940,144115188075855870,288230376151711740,576460752303423500,1152921504606847000,2305843009213694000,4611686018427388000,9223372036854776000}'::float8[])[((((((k_ix) >> 20) & 2047) - 1043) + 1022) & 63) + 1])) * 0.25 end;
      res := (1 - k_q) - ((0.5 * k_z - k_q) - k_u);
    end if;
  end if;

  end if;
  return case when (case when 0 = 0 then n else n + 1 end & 2) = 2 then -res else res end;
end $$;

-- V8's cos (ieee754.cc; Math.cos), with __ieee754_rem_pio2's reduction up to 2^19·π/2 and the kernels
-- inline. fn × pio2_1 is exact (20 by 31 bits), so its fused and unfused forms agree.
create function p3.fdlibm_cos(x float8) returns float8 language plpgsql immutable as $$
declare f_a float8; f_b float8; f_c float8; f_p float8; f_ah float8; f_bh float8; f_e float8; f_s float8; f_tl float8; f_w float8; k_ix int; k_hx int; k_x float8; k_y float8; k_z float8; k_v float8; k_r float8; k_u float8; k_q float8; k_w float8; k_a float8; k_t float8; k_s float8;
 hx int := (int8(float8send(x)) >> 32)::int; ix int := hx & 2147483647; z float8; w float8; t float8; r float8; fn float8; y0 float8; y1 float8; n int; j int; i int; u float8; res float8; kiy int;
begin
  if ix <= 0x3FE921FB then
    n := 0; y0 := x; y1 := 0; kiy := case when 1 = 0 then 0 else 1 end;
  elsif ix >= 0x7FF00000 then
    return case when x = 'NaN' then x else 'NaN'::float8 end;
  elsif ix < 0x4002D97C then
    if hx > 0 then
      z := x - 1.57079632673412561417e+00;
      if ix <> 0x3FF921FB then
        y0 := z - 6.07710050650619224932e-11;
        y1 := (z - y0) - 6.07710050650619224932e-11;
      else
        z := z - 6.07710050630396597660e-11;
        y0 := z - 2.02226624879595063154e-21;
        y1 := (z - y0) - 2.02226624879595063154e-21;
      end if;
      n := 1;
    else
      z := x + 1.57079632673412561417e+00;
      if ix <> 0x3FF921FB then
        y0 := z + 6.07710050650619224932e-11;
        y1 := (z - y0) + 6.07710050650619224932e-11;
      else
        z := z + 6.07710050630396597660e-11;
        y0 := z + 2.02226624879595063154e-21;
        y1 := (z - y0) + 2.02226624879595063154e-21;
      end if;
      n := -1;
    end if;
    kiy := case when 1 = 2 then -1 else 1 end;
  elsif ix > 0x413921FB then
    return fdlibm_trig_large(op => 1, x => x);
  else
    t := abs(x);
    if abs(t) >= 1e-144 and abs(t) <= 1e144 and abs((6.36619772367581382433e-01)::float8) >= 1e-144 and abs((6.36619772367581382433e-01)::float8) <= 1e144 and abs((0.5)::float8) <= 1e288 then
      f_p := t * (6.36619772367581382433e-01)::float8;
      f_ah := (t * 134217729 - (t * 134217729 - t));
      f_e := (t - f_ah) * ((6.36619772367581382433e-01)::float8 - ((6.36619772367581382433e-01)::float8 * 134217729 - ((6.36619772367581382433e-01)::float8 * 134217729 - (6.36619772367581382433e-01)::float8))) - (((f_p - f_ah * ((6.36619772367581382433e-01)::float8 * 134217729 - ((6.36619772367581382433e-01)::float8 * 134217729 - (6.36619772367581382433e-01)::float8))) - (t - f_ah) * ((6.36619772367581382433e-01)::float8 * 134217729 - ((6.36619772367581382433e-01)::float8 * 134217729 - (6.36619772367581382433e-01)::float8))) - f_ah * ((6.36619772367581382433e-01)::float8 - ((6.36619772367581382433e-01)::float8 * 134217729 - ((6.36619772367581382433e-01)::float8 * 134217729 - (6.36619772367581382433e-01)::float8))));
      f_s := (0.5)::float8 + f_p;
      f_tl := ((0.5)::float8 - (f_s - (f_s - (0.5)::float8))) + (f_p - (f_s - (0.5)::float8));
      f_w := (f_tl - ((f_tl + f_e) - ((f_tl + f_e) - f_tl))) + (f_e - ((f_tl + f_e) - f_tl));
      u := f_s + (f_tl + f_e);
      if f_w <> 0 and ((f_s - (u - (u - f_s))) + ((f_tl + f_e) - (u - f_s))) <> 0 and (u + 2 * ((f_s - (u - (u - f_s))) + ((f_tl + f_e) - (u - f_s)))) - u = 2 * ((f_s - (u - (u - f_s))) + ((f_tl + f_e) - (u - f_s))) and (f_w < 0) = (((f_s - (u - (u - f_s))) + ((f_tl + f_e) - (u - f_s))) < 0) then u := u + 2 * ((f_s - (u - (u - f_s))) + ((f_tl + f_e) - (u - f_s))); end if;
    elsif t = 0 or (6.36619772367581382433e-01)::float8 = 0 then
      u := t * (6.36619772367581382433e-01)::float8 + (0.5)::float8;
    else
      u := fdlibm_fma_wide(a => t, b => (6.36619772367581382433e-01)::float8, c => (0.5)::float8);
    end if;
    n := trunc(u)::int;
    fn := n;
    r := t - fn * 1.57079632673412561417e+00;
    w := fn * 6.07710050650619224932e-11;
    y0 := r - w;
    if (case when n < 32 then ix = ('{1073291771,1074340347,1074977148,1075388923,1075800698,1076025724,1076231611,1076437499,1076643386,1076849274,1076971356,1077074300,1077177244,1077280187,1077383131,1077486075,1077589019,1077691962,1077794906,1077897850,1077968460,1078019932,1078071404,1078122876,1078174348,1078225820,1078277292,1078328763,1078380235,1078431707,1078483179,1078534651}'::int[])[n] else true end) then
      j := ix >> 20;
      i := j - (((int8(float8send(y0)) >> 32)::int >> 20) & 0x7FF);
      if i > 16 then
        t := r;
        w := fn * 6.07710050630396597660e-11;
        r := t - w;
        f_c := -((t - r) - w);
        if abs(fn) >= 1e-144 and abs(fn) <= 1e144 and abs((2.02226624879595063154e-21)::float8) >= 1e-144 and abs((2.02226624879595063154e-21)::float8) <= 1e144 and abs(f_c) <= 1e288 then
          f_p := fn * (2.02226624879595063154e-21)::float8;
          f_ah := (fn * 134217729 - (fn * 134217729 - fn));
          f_e := (fn - f_ah) * ((2.02226624879595063154e-21)::float8 - ((2.02226624879595063154e-21)::float8 * 134217729 - ((2.02226624879595063154e-21)::float8 * 134217729 - (2.02226624879595063154e-21)::float8))) - (((f_p - f_ah * ((2.02226624879595063154e-21)::float8 * 134217729 - ((2.02226624879595063154e-21)::float8 * 134217729 - (2.02226624879595063154e-21)::float8))) - (fn - f_ah) * ((2.02226624879595063154e-21)::float8 * 134217729 - ((2.02226624879595063154e-21)::float8 * 134217729 - (2.02226624879595063154e-21)::float8))) - f_ah * ((2.02226624879595063154e-21)::float8 - ((2.02226624879595063154e-21)::float8 * 134217729 - ((2.02226624879595063154e-21)::float8 * 134217729 - (2.02226624879595063154e-21)::float8))));
          f_s := f_c + f_p;
          f_tl := (f_c - (f_s - (f_s - f_c))) + (f_p - (f_s - f_c));
          f_w := (f_tl - ((f_tl + f_e) - ((f_tl + f_e) - f_tl))) + (f_e - ((f_tl + f_e) - f_tl));
          w := f_s + (f_tl + f_e);
          if f_w <> 0 and ((f_s - (w - (w - f_s))) + ((f_tl + f_e) - (w - f_s))) <> 0 and (w + 2 * ((f_s - (w - (w - f_s))) + ((f_tl + f_e) - (w - f_s)))) - w = 2 * ((f_s - (w - (w - f_s))) + ((f_tl + f_e) - (w - f_s))) and (f_w < 0) = (((f_s - (w - (w - f_s))) + ((f_tl + f_e) - (w - f_s))) < 0) then w := w + 2 * ((f_s - (w - (w - f_s))) + ((f_tl + f_e) - (w - f_s))); end if;
        elsif fn = 0 or (2.02226624879595063154e-21)::float8 = 0 then
          w := fn * (2.02226624879595063154e-21)::float8 + f_c;
        else
          w := fdlibm_fma_wide(a => fn, b => (2.02226624879595063154e-21)::float8, c => f_c);
        end if;
        y0 := r - w;
        i := j - (((int8(float8send(y0)) >> 32)::int >> 20) & 0x7FF);
        if i > 49 then
          t := r;
          w := fn * 2.02226624871116645580e-21;
          r := t - w;
          f_c := -((t - r) - w);
          if abs(fn) >= 1e-144 and abs(fn) <= 1e144 and abs((8.47842766036889956997e-32)::float8) >= 1e-144 and abs((8.47842766036889956997e-32)::float8) <= 1e144 and abs(f_c) <= 1e288 then
            f_p := fn * (8.47842766036889956997e-32)::float8;
            f_ah := (fn * 134217729 - (fn * 134217729 - fn));
            f_e := (fn - f_ah) * ((8.47842766036889956997e-32)::float8 - ((8.47842766036889956997e-32)::float8 * 134217729 - ((8.47842766036889956997e-32)::float8 * 134217729 - (8.47842766036889956997e-32)::float8))) - (((f_p - f_ah * ((8.47842766036889956997e-32)::float8 * 134217729 - ((8.47842766036889956997e-32)::float8 * 134217729 - (8.47842766036889956997e-32)::float8))) - (fn - f_ah) * ((8.47842766036889956997e-32)::float8 * 134217729 - ((8.47842766036889956997e-32)::float8 * 134217729 - (8.47842766036889956997e-32)::float8))) - f_ah * ((8.47842766036889956997e-32)::float8 - ((8.47842766036889956997e-32)::float8 * 134217729 - ((8.47842766036889956997e-32)::float8 * 134217729 - (8.47842766036889956997e-32)::float8))));
            f_s := f_c + f_p;
            f_tl := (f_c - (f_s - (f_s - f_c))) + (f_p - (f_s - f_c));
            f_w := (f_tl - ((f_tl + f_e) - ((f_tl + f_e) - f_tl))) + (f_e - ((f_tl + f_e) - f_tl));
            w := f_s + (f_tl + f_e);
            if f_w <> 0 and ((f_s - (w - (w - f_s))) + ((f_tl + f_e) - (w - f_s))) <> 0 and (w + 2 * ((f_s - (w - (w - f_s))) + ((f_tl + f_e) - (w - f_s)))) - w = 2 * ((f_s - (w - (w - f_s))) + ((f_tl + f_e) - (w - f_s))) and (f_w < 0) = (((f_s - (w - (w - f_s))) + ((f_tl + f_e) - (w - f_s))) < 0) then w := w + 2 * ((f_s - (w - (w - f_s))) + ((f_tl + f_e) - (w - f_s))); end if;
          elsif fn = 0 or (8.47842766036889956997e-32)::float8 = 0 then
            w := fn * (8.47842766036889956997e-32)::float8 + f_c;
          else
            w := fdlibm_fma_wide(a => fn, b => (8.47842766036889956997e-32)::float8, c => f_c);
          end if;
          y0 := r - w;
        end if;
      end if;
    end if;
    y1 := (r - y0) - w;
    if hx < 0 then n := -n; y0 := -y0; y1 := -y1; end if;
    kiy := case when 1 = 2 then 1 - ((n & 1) << 1) else 1 end;
  end if;
  -- the kernel of n mod 4 (sin: S C -S -C; cos: C -S -C S; tan: T, -1/T by the parity of n)
  if 1 = 2 then
  k_x := y0;
  k_y := y1;
  k_hx := (int8(float8send(k_x)) >> 32)::int;
  k_ix := k_hx & 2147483647;
  if k_ix < 0x3E300000 then
    if k_ix = 0 and (int8(float8send(k_x)) & 4294967295) = 0 and kiy = -1 then
      res := 'Infinity';
    elsif kiy = 1 then
      res := k_x;
    else
      k_w := k_x + k_y;
      k_z := (trunc((k_w) * (('{2.2250738585072014e-308,4.1045368012983762e-289,7.571533991467358e-270,1.3967014978599092e-250,2.5764595078388533e-231,4.7527289157379e-212,8.767237396033612e-193,1.617269844780878e-173,2.983336292480083e-154,5.503284107318959e-135,1.0151767349262597e-115,1.8726705418768793e-96,3.454467422037778e-77,6.372367644529809e-58,1.1754943508222875e-38,2.168404344971009e-19,4,73786976294838210000,1.361129467683754e+39,2.5108406941546723e+58,4.631683569492648e+77,8.54394814368364e+96,1.5760802478557792e+116,2.9073548971824276e+135,5.363123171977039e+154,9.893216058924181e+173,1.824976247048878e+193,3.366486976990959e+212,6.210072369202836e+231,1.1455561567389984e+251,2.113178124542661e+270,3.89812560456e+289}'::float8[])[(((1043 - ((((int8(float8send(k_w)) >> 32)::int) >> 20) & 2047)) + 1022) >> 6) + 1] * ('{1,2,4,8,16,32,64,128,256,512,1024,2048,4096,8192,16384,32768,65536,131072,262144,524288,1048576,2097152,4194304,8388608,16777216,33554432,67108864,134217728,268435456,536870912,1073741824,2147483648,4294967296,8589934592,17179869184,34359738368,68719476736,137438953472,274877906944,549755813888,1099511627776,2199023255552,4398046511104,8796093022208,17592186044416,35184372088832,70368744177664,140737488355328,281474976710656,562949953421312,1125899906842624,2251799813685248,4503599627370496,9007199254740992,18014398509481984,36028797018963970,72057594037927940,144115188075855870,288230376151711740,576460752303423500,1152921504606847000,2305843009213694000,4611686018427388000,9223372036854776000}'::float8[])[(((1043 - ((((int8(float8send(k_w)) >> 32)::int) >> 20) & 2047)) + 1022) & 63) + 1])) * (('{2.2250738585072014e-308,4.1045368012983762e-289,7.571533991467358e-270,1.3967014978599092e-250,2.5764595078388533e-231,4.7527289157379e-212,8.767237396033612e-193,1.617269844780878e-173,2.983336292480083e-154,5.503284107318959e-135,1.0151767349262597e-115,1.8726705418768793e-96,3.454467422037778e-77,6.372367644529809e-58,1.1754943508222875e-38,2.168404344971009e-19,4,73786976294838210000,1.361129467683754e+39,2.5108406941546723e+58,4.631683569492648e+77,8.54394814368364e+96,1.5760802478557792e+116,2.9073548971824276e+135,5.363123171977039e+154,9.893216058924181e+173,1.824976247048878e+193,3.366486976990959e+212,6.210072369202836e+231,1.1455561567389984e+251,2.113178124542661e+270,3.89812560456e+289}'::float8[])[(((((((int8(float8send(k_w)) >> 32)::int) >> 20) & 2047) - 1043) + 1022) >> 6) + 1] * ('{1,2,4,8,16,32,64,128,256,512,1024,2048,4096,8192,16384,32768,65536,131072,262144,524288,1048576,2097152,4194304,8388608,16777216,33554432,67108864,134217728,268435456,536870912,1073741824,2147483648,4294967296,8589934592,17179869184,34359738368,68719476736,137438953472,274877906944,549755813888,1099511627776,2199023255552,4398046511104,8796093022208,17592186044416,35184372088832,70368744177664,140737488355328,281474976710656,562949953421312,1125899906842624,2251799813685248,4503599627370496,9007199254740992,18014398509481984,36028797018963970,72057594037927940,144115188075855870,288230376151711740,576460752303423500,1152921504606847000,2305843009213694000,4611686018427388000,9223372036854776000}'::float8[])[(((((((int8(float8send(k_w)) >> 32)::int) >> 20) & 2047) - 1043) + 1022) & 63) + 1]));
      k_v := k_y - (k_z - k_x);
      k_a := -1 / k_w;
      k_t := (trunc((k_a) * (('{2.2250738585072014e-308,4.1045368012983762e-289,7.571533991467358e-270,1.3967014978599092e-250,2.5764595078388533e-231,4.7527289157379e-212,8.767237396033612e-193,1.617269844780878e-173,2.983336292480083e-154,5.503284107318959e-135,1.0151767349262597e-115,1.8726705418768793e-96,3.454467422037778e-77,6.372367644529809e-58,1.1754943508222875e-38,2.168404344971009e-19,4,73786976294838210000,1.361129467683754e+39,2.5108406941546723e+58,4.631683569492648e+77,8.54394814368364e+96,1.5760802478557792e+116,2.9073548971824276e+135,5.363123171977039e+154,9.893216058924181e+173,1.824976247048878e+193,3.366486976990959e+212,6.210072369202836e+231,1.1455561567389984e+251,2.113178124542661e+270,3.89812560456e+289}'::float8[])[(((1043 - ((((int8(float8send(k_a)) >> 32)::int) >> 20) & 2047)) + 1022) >> 6) + 1] * ('{1,2,4,8,16,32,64,128,256,512,1024,2048,4096,8192,16384,32768,65536,131072,262144,524288,1048576,2097152,4194304,8388608,16777216,33554432,67108864,134217728,268435456,536870912,1073741824,2147483648,4294967296,8589934592,17179869184,34359738368,68719476736,137438953472,274877906944,549755813888,1099511627776,2199023255552,4398046511104,8796093022208,17592186044416,35184372088832,70368744177664,140737488355328,281474976710656,562949953421312,1125899906842624,2251799813685248,4503599627370496,9007199254740992,18014398509481984,36028797018963970,72057594037927940,144115188075855870,288230376151711740,576460752303423500,1152921504606847000,2305843009213694000,4611686018427388000,9223372036854776000}'::float8[])[(((1043 - ((((int8(float8send(k_a)) >> 32)::int) >> 20) & 2047)) + 1022) & 63) + 1])) * (('{2.2250738585072014e-308,4.1045368012983762e-289,7.571533991467358e-270,1.3967014978599092e-250,2.5764595078388533e-231,4.7527289157379e-212,8.767237396033612e-193,1.617269844780878e-173,2.983336292480083e-154,5.503284107318959e-135,1.0151767349262597e-115,1.8726705418768793e-96,3.454467422037778e-77,6.372367644529809e-58,1.1754943508222875e-38,2.168404344971009e-19,4,73786976294838210000,1.361129467683754e+39,2.5108406941546723e+58,4.631683569492648e+77,8.54394814368364e+96,1.5760802478557792e+116,2.9073548971824276e+135,5.363123171977039e+154,9.893216058924181e+173,1.824976247048878e+193,3.366486976990959e+212,6.210072369202836e+231,1.1455561567389984e+251,2.113178124542661e+270,3.89812560456e+289}'::float8[])[(((((((int8(float8send(k_a)) >> 32)::int) >> 20) & 2047) - 1043) + 1022) >> 6) + 1] * ('{1,2,4,8,16,32,64,128,256,512,1024,2048,4096,8192,16384,32768,65536,131072,262144,524288,1048576,2097152,4194304,8388608,16777216,33554432,67108864,134217728,268435456,536870912,1073741824,2147483648,4294967296,8589934592,17179869184,34359738368,68719476736,137438953472,274877906944,549755813888,1099511627776,2199023255552,4398046511104,8796093022208,17592186044416,35184372088832,70368744177664,140737488355328,281474976710656,562949953421312,1125899906842624,2251799813685248,4503599627370496,9007199254740992,18014398509481984,36028797018963970,72057594037927940,144115188075855870,288230376151711740,576460752303423500,1152921504606847000,2305843009213694000,4611686018427388000,9223372036854776000}'::float8[])[(((((((int8(float8send(k_a)) >> 32)::int) >> 20) & 2047) - 1043) + 1022) & 63) + 1]));
      if abs(k_t) >= 1e-144 and abs(k_t) <= 1e144 and abs(k_z) >= 1e-144 and abs(k_z) <= 1e144 and abs((1)::float8) <= 1e288 then
        f_p := k_t * k_z;
        f_ah := (k_t * 134217729 - (k_t * 134217729 - k_t));
        f_bh := (k_z * 134217729 - (k_z * 134217729 - k_z));
        f_e := (k_t - f_ah) * (k_z - f_bh) - (((f_p - f_ah * f_bh) - (k_t - f_ah) * f_bh) - f_ah * (k_z - f_bh));
        f_s := (1)::float8 + f_p;
        f_tl := ((1)::float8 - (f_s - (f_s - (1)::float8))) + (f_p - (f_s - (1)::float8));
        f_w := (f_tl - ((f_tl + f_e) - ((f_tl + f_e) - f_tl))) + (f_e - ((f_tl + f_e) - f_tl));
        k_s := f_s + (f_tl + f_e);
        if f_w <> 0 and ((f_s - (k_s - (k_s - f_s))) + ((f_tl + f_e) - (k_s - f_s))) <> 0 and (k_s + 2 * ((f_s - (k_s - (k_s - f_s))) + ((f_tl + f_e) - (k_s - f_s)))) - k_s = 2 * ((f_s - (k_s - (k_s - f_s))) + ((f_tl + f_e) - (k_s - f_s))) and (f_w < 0) = (((f_s - (k_s - (k_s - f_s))) + ((f_tl + f_e) - (k_s - f_s))) < 0) then k_s := k_s + 2 * ((f_s - (k_s - (k_s - f_s))) + ((f_tl + f_e) - (k_s - f_s))); end if;
      elsif k_t = 0 or k_z = 0 then
        k_s := k_t * k_z + (1)::float8;
      else
        k_s := fdlibm_fma_wide(a => k_t, b => k_z, c => (1)::float8);
      end if;
      if abs(k_t) >= 1e-144 and abs(k_t) <= 1e144 and abs(k_v) >= 1e-144 and abs(k_v) <= 1e144 and abs(k_s) <= 1e288 then
        f_p := k_t * k_v;
        f_ah := (k_t * 134217729 - (k_t * 134217729 - k_t));
        f_bh := (k_v * 134217729 - (k_v * 134217729 - k_v));
        f_e := (k_t - f_ah) * (k_v - f_bh) - (((f_p - f_ah * f_bh) - (k_t - f_ah) * f_bh) - f_ah * (k_v - f_bh));
        f_s := k_s + f_p;
        f_tl := (k_s - (f_s - (f_s - k_s))) + (f_p - (f_s - k_s));
        f_w := (f_tl - ((f_tl + f_e) - ((f_tl + f_e) - f_tl))) + (f_e - ((f_tl + f_e) - f_tl));
        k_u := f_s + (f_tl + f_e);
        if f_w <> 0 and ((f_s - (k_u - (k_u - f_s))) + ((f_tl + f_e) - (k_u - f_s))) <> 0 and (k_u + 2 * ((f_s - (k_u - (k_u - f_s))) + ((f_tl + f_e) - (k_u - f_s)))) - k_u = 2 * ((f_s - (k_u - (k_u - f_s))) + ((f_tl + f_e) - (k_u - f_s))) and (f_w < 0) = (((f_s - (k_u - (k_u - f_s))) + ((f_tl + f_e) - (k_u - f_s))) < 0) then k_u := k_u + 2 * ((f_s - (k_u - (k_u - f_s))) + ((f_tl + f_e) - (k_u - f_s))); end if;
      elsif k_t = 0 or k_v = 0 then
        k_u := k_t * k_v + k_s;
      else
        k_u := fdlibm_fma_wide(a => k_t, b => k_v, c => k_s);
      end if;
      if abs(k_a) >= 1e-144 and abs(k_a) <= 1e144 and abs(k_u) >= 1e-144 and abs(k_u) <= 1e144 and abs(k_t) <= 1e288 then
        f_p := k_a * k_u;
        f_ah := (k_a * 134217729 - (k_a * 134217729 - k_a));
        f_bh := (k_u * 134217729 - (k_u * 134217729 - k_u));
        f_e := (k_a - f_ah) * (k_u - f_bh) - (((f_p - f_ah * f_bh) - (k_a - f_ah) * f_bh) - f_ah * (k_u - f_bh));
        f_s := k_t + f_p;
        f_tl := (k_t - (f_s - (f_s - k_t))) + (f_p - (f_s - k_t));
        f_w := (f_tl - ((f_tl + f_e) - ((f_tl + f_e) - f_tl))) + (f_e - ((f_tl + f_e) - f_tl));
        res := f_s + (f_tl + f_e);
        if f_w <> 0 and ((f_s - (res - (res - f_s))) + ((f_tl + f_e) - (res - f_s))) <> 0 and (res + 2 * ((f_s - (res - (res - f_s))) + ((f_tl + f_e) - (res - f_s)))) - res = 2 * ((f_s - (res - (res - f_s))) + ((f_tl + f_e) - (res - f_s))) and (f_w < 0) = (((f_s - (res - (res - f_s))) + ((f_tl + f_e) - (res - f_s))) < 0) then res := res + 2 * ((f_s - (res - (res - f_s))) + ((f_tl + f_e) - (res - f_s))); end if;
      elsif k_a = 0 or k_u = 0 then
        res := k_a * k_u + k_t;
      else
        res := fdlibm_fma_wide(a => k_a, b => k_u, c => k_t);
      end if;
    end if;
  else
    if k_ix >= 0x3FE59428 then
      if k_hx < 0 then k_x := -k_x; k_y := -k_y; end if;
      k_z := 7.85398163397448278999e-01 - k_x;
      k_w := 3.06161699786838301793e-17 - k_y;
      k_x := k_z + k_w;
      k_y := 0;
    end if;
    k_z := k_x * k_x;
    k_w := k_z * k_z;
    if abs(k_w) >= 1e-144 and abs(k_w) <= 1e144 and abs((-1.85586374855275456654e-05)::float8) >= 1e-144 and abs((-1.85586374855275456654e-05)::float8) <= 1e144 and abs((7.81794442939557092300e-05)::float8) <= 1e288 then
      f_p := k_w * (-1.85586374855275456654e-05)::float8;
      f_ah := (k_w * 134217729 - (k_w * 134217729 - k_w));
      f_e := (k_w - f_ah) * ((-1.85586374855275456654e-05)::float8 - ((-1.85586374855275456654e-05)::float8 * 134217729 - ((-1.85586374855275456654e-05)::float8 * 134217729 - (-1.85586374855275456654e-05)::float8))) - (((f_p - f_ah * ((-1.85586374855275456654e-05)::float8 * 134217729 - ((-1.85586374855275456654e-05)::float8 * 134217729 - (-1.85586374855275456654e-05)::float8))) - (k_w - f_ah) * ((-1.85586374855275456654e-05)::float8 * 134217729 - ((-1.85586374855275456654e-05)::float8 * 134217729 - (-1.85586374855275456654e-05)::float8))) - f_ah * ((-1.85586374855275456654e-05)::float8 - ((-1.85586374855275456654e-05)::float8 * 134217729 - ((-1.85586374855275456654e-05)::float8 * 134217729 - (-1.85586374855275456654e-05)::float8))));
      f_s := (7.81794442939557092300e-05)::float8 + f_p;
      f_tl := ((7.81794442939557092300e-05)::float8 - (f_s - (f_s - (7.81794442939557092300e-05)::float8))) + (f_p - (f_s - (7.81794442939557092300e-05)::float8));
      f_w := (f_tl - ((f_tl + f_e) - ((f_tl + f_e) - f_tl))) + (f_e - ((f_tl + f_e) - f_tl));
      k_r := f_s + (f_tl + f_e);
      if f_w <> 0 and ((f_s - (k_r - (k_r - f_s))) + ((f_tl + f_e) - (k_r - f_s))) <> 0 and (k_r + 2 * ((f_s - (k_r - (k_r - f_s))) + ((f_tl + f_e) - (k_r - f_s)))) - k_r = 2 * ((f_s - (k_r - (k_r - f_s))) + ((f_tl + f_e) - (k_r - f_s))) and (f_w < 0) = (((f_s - (k_r - (k_r - f_s))) + ((f_tl + f_e) - (k_r - f_s))) < 0) then k_r := k_r + 2 * ((f_s - (k_r - (k_r - f_s))) + ((f_tl + f_e) - (k_r - f_s))); end if;
    elsif k_w = 0 or (-1.85586374855275456654e-05)::float8 = 0 then
      k_r := k_w * (-1.85586374855275456654e-05)::float8 + (7.81794442939557092300e-05)::float8;
    else
      k_r := fdlibm_fma_wide(a => k_w, b => (-1.85586374855275456654e-05)::float8, c => (7.81794442939557092300e-05)::float8);
    end if;
    if abs(k_w) >= 1e-144 and abs(k_w) <= 1e144 and abs(k_r) >= 1e-144 and abs(k_r) <= 1e144 and abs((5.88041240820264096874e-04)::float8) <= 1e288 then
      f_p := k_w * k_r;
      f_ah := (k_w * 134217729 - (k_w * 134217729 - k_w));
      f_bh := (k_r * 134217729 - (k_r * 134217729 - k_r));
      f_e := (k_w - f_ah) * (k_r - f_bh) - (((f_p - f_ah * f_bh) - (k_w - f_ah) * f_bh) - f_ah * (k_r - f_bh));
      f_s := (5.88041240820264096874e-04)::float8 + f_p;
      f_tl := ((5.88041240820264096874e-04)::float8 - (f_s - (f_s - (5.88041240820264096874e-04)::float8))) + (f_p - (f_s - (5.88041240820264096874e-04)::float8));
      f_w := (f_tl - ((f_tl + f_e) - ((f_tl + f_e) - f_tl))) + (f_e - ((f_tl + f_e) - f_tl));
      k_r := f_s + (f_tl + f_e);
      if f_w <> 0 and ((f_s - (k_r - (k_r - f_s))) + ((f_tl + f_e) - (k_r - f_s))) <> 0 and (k_r + 2 * ((f_s - (k_r - (k_r - f_s))) + ((f_tl + f_e) - (k_r - f_s)))) - k_r = 2 * ((f_s - (k_r - (k_r - f_s))) + ((f_tl + f_e) - (k_r - f_s))) and (f_w < 0) = (((f_s - (k_r - (k_r - f_s))) + ((f_tl + f_e) - (k_r - f_s))) < 0) then k_r := k_r + 2 * ((f_s - (k_r - (k_r - f_s))) + ((f_tl + f_e) - (k_r - f_s))); end if;
    elsif k_w = 0 or k_r = 0 then
      k_r := k_w * k_r + (5.88041240820264096874e-04)::float8;
    else
      k_r := fdlibm_fma_wide(a => k_w, b => k_r, c => (5.88041240820264096874e-04)::float8);
    end if;
    if abs(k_w) >= 1e-144 and abs(k_w) <= 1e144 and abs(k_r) >= 1e-144 and abs(k_r) <= 1e144 and abs((3.59207910759131235356e-03)::float8) <= 1e288 then
      f_p := k_w * k_r;
      f_ah := (k_w * 134217729 - (k_w * 134217729 - k_w));
      f_bh := (k_r * 134217729 - (k_r * 134217729 - k_r));
      f_e := (k_w - f_ah) * (k_r - f_bh) - (((f_p - f_ah * f_bh) - (k_w - f_ah) * f_bh) - f_ah * (k_r - f_bh));
      f_s := (3.59207910759131235356e-03)::float8 + f_p;
      f_tl := ((3.59207910759131235356e-03)::float8 - (f_s - (f_s - (3.59207910759131235356e-03)::float8))) + (f_p - (f_s - (3.59207910759131235356e-03)::float8));
      f_w := (f_tl - ((f_tl + f_e) - ((f_tl + f_e) - f_tl))) + (f_e - ((f_tl + f_e) - f_tl));
      k_r := f_s + (f_tl + f_e);
      if f_w <> 0 and ((f_s - (k_r - (k_r - f_s))) + ((f_tl + f_e) - (k_r - f_s))) <> 0 and (k_r + 2 * ((f_s - (k_r - (k_r - f_s))) + ((f_tl + f_e) - (k_r - f_s)))) - k_r = 2 * ((f_s - (k_r - (k_r - f_s))) + ((f_tl + f_e) - (k_r - f_s))) and (f_w < 0) = (((f_s - (k_r - (k_r - f_s))) + ((f_tl + f_e) - (k_r - f_s))) < 0) then k_r := k_r + 2 * ((f_s - (k_r - (k_r - f_s))) + ((f_tl + f_e) - (k_r - f_s))); end if;
    elsif k_w = 0 or k_r = 0 then
      k_r := k_w * k_r + (3.59207910759131235356e-03)::float8;
    else
      k_r := fdlibm_fma_wide(a => k_w, b => k_r, c => (3.59207910759131235356e-03)::float8);
    end if;
    if abs(k_w) >= 1e-144 and abs(k_w) <= 1e144 and abs(k_r) >= 1e-144 and abs(k_r) <= 1e144 and abs((2.18694882948595424599e-02)::float8) <= 1e288 then
      f_p := k_w * k_r;
      f_ah := (k_w * 134217729 - (k_w * 134217729 - k_w));
      f_bh := (k_r * 134217729 - (k_r * 134217729 - k_r));
      f_e := (k_w - f_ah) * (k_r - f_bh) - (((f_p - f_ah * f_bh) - (k_w - f_ah) * f_bh) - f_ah * (k_r - f_bh));
      f_s := (2.18694882948595424599e-02)::float8 + f_p;
      f_tl := ((2.18694882948595424599e-02)::float8 - (f_s - (f_s - (2.18694882948595424599e-02)::float8))) + (f_p - (f_s - (2.18694882948595424599e-02)::float8));
      f_w := (f_tl - ((f_tl + f_e) - ((f_tl + f_e) - f_tl))) + (f_e - ((f_tl + f_e) - f_tl));
      k_r := f_s + (f_tl + f_e);
      if f_w <> 0 and ((f_s - (k_r - (k_r - f_s))) + ((f_tl + f_e) - (k_r - f_s))) <> 0 and (k_r + 2 * ((f_s - (k_r - (k_r - f_s))) + ((f_tl + f_e) - (k_r - f_s)))) - k_r = 2 * ((f_s - (k_r - (k_r - f_s))) + ((f_tl + f_e) - (k_r - f_s))) and (f_w < 0) = (((f_s - (k_r - (k_r - f_s))) + ((f_tl + f_e) - (k_r - f_s))) < 0) then k_r := k_r + 2 * ((f_s - (k_r - (k_r - f_s))) + ((f_tl + f_e) - (k_r - f_s))); end if;
    elsif k_w = 0 or k_r = 0 then
      k_r := k_w * k_r + (2.18694882948595424599e-02)::float8;
    else
      k_r := fdlibm_fma_wide(a => k_w, b => k_r, c => (2.18694882948595424599e-02)::float8);
    end if;
    if abs(k_w) >= 1e-144 and abs(k_w) <= 1e144 and abs(k_r) >= 1e-144 and abs(k_r) <= 1e144 and abs((1.33333333333201242699e-01)::float8) <= 1e288 then
      f_p := k_w * k_r;
      f_ah := (k_w * 134217729 - (k_w * 134217729 - k_w));
      f_bh := (k_r * 134217729 - (k_r * 134217729 - k_r));
      f_e := (k_w - f_ah) * (k_r - f_bh) - (((f_p - f_ah * f_bh) - (k_w - f_ah) * f_bh) - f_ah * (k_r - f_bh));
      f_s := (1.33333333333201242699e-01)::float8 + f_p;
      f_tl := ((1.33333333333201242699e-01)::float8 - (f_s - (f_s - (1.33333333333201242699e-01)::float8))) + (f_p - (f_s - (1.33333333333201242699e-01)::float8));
      f_w := (f_tl - ((f_tl + f_e) - ((f_tl + f_e) - f_tl))) + (f_e - ((f_tl + f_e) - f_tl));
      k_r := f_s + (f_tl + f_e);
      if f_w <> 0 and ((f_s - (k_r - (k_r - f_s))) + ((f_tl + f_e) - (k_r - f_s))) <> 0 and (k_r + 2 * ((f_s - (k_r - (k_r - f_s))) + ((f_tl + f_e) - (k_r - f_s)))) - k_r = 2 * ((f_s - (k_r - (k_r - f_s))) + ((f_tl + f_e) - (k_r - f_s))) and (f_w < 0) = (((f_s - (k_r - (k_r - f_s))) + ((f_tl + f_e) - (k_r - f_s))) < 0) then k_r := k_r + 2 * ((f_s - (k_r - (k_r - f_s))) + ((f_tl + f_e) - (k_r - f_s))); end if;
    elsif k_w = 0 or k_r = 0 then
      k_r := k_w * k_r + (1.33333333333201242699e-01)::float8;
    else
      k_r := fdlibm_fma_wide(a => k_w, b => k_r, c => (1.33333333333201242699e-01)::float8);
    end if;
    if abs(k_w) >= 1e-144 and abs(k_w) <= 1e144 and abs((2.59073051863633712884e-05)::float8) >= 1e-144 and abs((2.59073051863633712884e-05)::float8) <= 1e144 and abs((7.14072491382608190305e-05)::float8) <= 1e288 then
      f_p := k_w * (2.59073051863633712884e-05)::float8;
      f_ah := (k_w * 134217729 - (k_w * 134217729 - k_w));
      f_e := (k_w - f_ah) * ((2.59073051863633712884e-05)::float8 - ((2.59073051863633712884e-05)::float8 * 134217729 - ((2.59073051863633712884e-05)::float8 * 134217729 - (2.59073051863633712884e-05)::float8))) - (((f_p - f_ah * ((2.59073051863633712884e-05)::float8 * 134217729 - ((2.59073051863633712884e-05)::float8 * 134217729 - (2.59073051863633712884e-05)::float8))) - (k_w - f_ah) * ((2.59073051863633712884e-05)::float8 * 134217729 - ((2.59073051863633712884e-05)::float8 * 134217729 - (2.59073051863633712884e-05)::float8))) - f_ah * ((2.59073051863633712884e-05)::float8 - ((2.59073051863633712884e-05)::float8 * 134217729 - ((2.59073051863633712884e-05)::float8 * 134217729 - (2.59073051863633712884e-05)::float8))));
      f_s := (7.14072491382608190305e-05)::float8 + f_p;
      f_tl := ((7.14072491382608190305e-05)::float8 - (f_s - (f_s - (7.14072491382608190305e-05)::float8))) + (f_p - (f_s - (7.14072491382608190305e-05)::float8));
      f_w := (f_tl - ((f_tl + f_e) - ((f_tl + f_e) - f_tl))) + (f_e - ((f_tl + f_e) - f_tl));
      k_v := f_s + (f_tl + f_e);
      if f_w <> 0 and ((f_s - (k_v - (k_v - f_s))) + ((f_tl + f_e) - (k_v - f_s))) <> 0 and (k_v + 2 * ((f_s - (k_v - (k_v - f_s))) + ((f_tl + f_e) - (k_v - f_s)))) - k_v = 2 * ((f_s - (k_v - (k_v - f_s))) + ((f_tl + f_e) - (k_v - f_s))) and (f_w < 0) = (((f_s - (k_v - (k_v - f_s))) + ((f_tl + f_e) - (k_v - f_s))) < 0) then k_v := k_v + 2 * ((f_s - (k_v - (k_v - f_s))) + ((f_tl + f_e) - (k_v - f_s))); end if;
    elsif k_w = 0 or (2.59073051863633712884e-05)::float8 = 0 then
      k_v := k_w * (2.59073051863633712884e-05)::float8 + (7.14072491382608190305e-05)::float8;
    else
      k_v := fdlibm_fma_wide(a => k_w, b => (2.59073051863633712884e-05)::float8, c => (7.14072491382608190305e-05)::float8);
    end if;
    if abs(k_w) >= 1e-144 and abs(k_w) <= 1e144 and abs(k_v) >= 1e-144 and abs(k_v) <= 1e144 and abs((2.46463134818469906812e-04)::float8) <= 1e288 then
      f_p := k_w * k_v;
      f_ah := (k_w * 134217729 - (k_w * 134217729 - k_w));
      f_bh := (k_v * 134217729 - (k_v * 134217729 - k_v));
      f_e := (k_w - f_ah) * (k_v - f_bh) - (((f_p - f_ah * f_bh) - (k_w - f_ah) * f_bh) - f_ah * (k_v - f_bh));
      f_s := (2.46463134818469906812e-04)::float8 + f_p;
      f_tl := ((2.46463134818469906812e-04)::float8 - (f_s - (f_s - (2.46463134818469906812e-04)::float8))) + (f_p - (f_s - (2.46463134818469906812e-04)::float8));
      f_w := (f_tl - ((f_tl + f_e) - ((f_tl + f_e) - f_tl))) + (f_e - ((f_tl + f_e) - f_tl));
      k_v := f_s + (f_tl + f_e);
      if f_w <> 0 and ((f_s - (k_v - (k_v - f_s))) + ((f_tl + f_e) - (k_v - f_s))) <> 0 and (k_v + 2 * ((f_s - (k_v - (k_v - f_s))) + ((f_tl + f_e) - (k_v - f_s)))) - k_v = 2 * ((f_s - (k_v - (k_v - f_s))) + ((f_tl + f_e) - (k_v - f_s))) and (f_w < 0) = (((f_s - (k_v - (k_v - f_s))) + ((f_tl + f_e) - (k_v - f_s))) < 0) then k_v := k_v + 2 * ((f_s - (k_v - (k_v - f_s))) + ((f_tl + f_e) - (k_v - f_s))); end if;
    elsif k_w = 0 or k_v = 0 then
      k_v := k_w * k_v + (2.46463134818469906812e-04)::float8;
    else
      k_v := fdlibm_fma_wide(a => k_w, b => k_v, c => (2.46463134818469906812e-04)::float8);
    end if;
    if abs(k_w) >= 1e-144 and abs(k_w) <= 1e144 and abs(k_v) >= 1e-144 and abs(k_v) <= 1e144 and abs((1.45620945432529025516e-03)::float8) <= 1e288 then
      f_p := k_w * k_v;
      f_ah := (k_w * 134217729 - (k_w * 134217729 - k_w));
      f_bh := (k_v * 134217729 - (k_v * 134217729 - k_v));
      f_e := (k_w - f_ah) * (k_v - f_bh) - (((f_p - f_ah * f_bh) - (k_w - f_ah) * f_bh) - f_ah * (k_v - f_bh));
      f_s := (1.45620945432529025516e-03)::float8 + f_p;
      f_tl := ((1.45620945432529025516e-03)::float8 - (f_s - (f_s - (1.45620945432529025516e-03)::float8))) + (f_p - (f_s - (1.45620945432529025516e-03)::float8));
      f_w := (f_tl - ((f_tl + f_e) - ((f_tl + f_e) - f_tl))) + (f_e - ((f_tl + f_e) - f_tl));
      k_v := f_s + (f_tl + f_e);
      if f_w <> 0 and ((f_s - (k_v - (k_v - f_s))) + ((f_tl + f_e) - (k_v - f_s))) <> 0 and (k_v + 2 * ((f_s - (k_v - (k_v - f_s))) + ((f_tl + f_e) - (k_v - f_s)))) - k_v = 2 * ((f_s - (k_v - (k_v - f_s))) + ((f_tl + f_e) - (k_v - f_s))) and (f_w < 0) = (((f_s - (k_v - (k_v - f_s))) + ((f_tl + f_e) - (k_v - f_s))) < 0) then k_v := k_v + 2 * ((f_s - (k_v - (k_v - f_s))) + ((f_tl + f_e) - (k_v - f_s))); end if;
    elsif k_w = 0 or k_v = 0 then
      k_v := k_w * k_v + (1.45620945432529025516e-03)::float8;
    else
      k_v := fdlibm_fma_wide(a => k_w, b => k_v, c => (1.45620945432529025516e-03)::float8);
    end if;
    if abs(k_w) >= 1e-144 and abs(k_w) <= 1e144 and abs(k_v) >= 1e-144 and abs(k_v) <= 1e144 and abs((8.86323982359930005737e-03)::float8) <= 1e288 then
      f_p := k_w * k_v;
      f_ah := (k_w * 134217729 - (k_w * 134217729 - k_w));
      f_bh := (k_v * 134217729 - (k_v * 134217729 - k_v));
      f_e := (k_w - f_ah) * (k_v - f_bh) - (((f_p - f_ah * f_bh) - (k_w - f_ah) * f_bh) - f_ah * (k_v - f_bh));
      f_s := (8.86323982359930005737e-03)::float8 + f_p;
      f_tl := ((8.86323982359930005737e-03)::float8 - (f_s - (f_s - (8.86323982359930005737e-03)::float8))) + (f_p - (f_s - (8.86323982359930005737e-03)::float8));
      f_w := (f_tl - ((f_tl + f_e) - ((f_tl + f_e) - f_tl))) + (f_e - ((f_tl + f_e) - f_tl));
      k_v := f_s + (f_tl + f_e);
      if f_w <> 0 and ((f_s - (k_v - (k_v - f_s))) + ((f_tl + f_e) - (k_v - f_s))) <> 0 and (k_v + 2 * ((f_s - (k_v - (k_v - f_s))) + ((f_tl + f_e) - (k_v - f_s)))) - k_v = 2 * ((f_s - (k_v - (k_v - f_s))) + ((f_tl + f_e) - (k_v - f_s))) and (f_w < 0) = (((f_s - (k_v - (k_v - f_s))) + ((f_tl + f_e) - (k_v - f_s))) < 0) then k_v := k_v + 2 * ((f_s - (k_v - (k_v - f_s))) + ((f_tl + f_e) - (k_v - f_s))); end if;
    elsif k_w = 0 or k_v = 0 then
      k_v := k_w * k_v + (8.86323982359930005737e-03)::float8;
    else
      k_v := fdlibm_fma_wide(a => k_w, b => k_v, c => (8.86323982359930005737e-03)::float8);
    end if;
    if abs(k_w) >= 1e-144 and abs(k_w) <= 1e144 and abs(k_v) >= 1e-144 and abs(k_v) <= 1e144 and abs((5.39682539762260521377e-02)::float8) <= 1e288 then
      f_p := k_w * k_v;
      f_ah := (k_w * 134217729 - (k_w * 134217729 - k_w));
      f_bh := (k_v * 134217729 - (k_v * 134217729 - k_v));
      f_e := (k_w - f_ah) * (k_v - f_bh) - (((f_p - f_ah * f_bh) - (k_w - f_ah) * f_bh) - f_ah * (k_v - f_bh));
      f_s := (5.39682539762260521377e-02)::float8 + f_p;
      f_tl := ((5.39682539762260521377e-02)::float8 - (f_s - (f_s - (5.39682539762260521377e-02)::float8))) + (f_p - (f_s - (5.39682539762260521377e-02)::float8));
      f_w := (f_tl - ((f_tl + f_e) - ((f_tl + f_e) - f_tl))) + (f_e - ((f_tl + f_e) - f_tl));
      k_v := f_s + (f_tl + f_e);
      if f_w <> 0 and ((f_s - (k_v - (k_v - f_s))) + ((f_tl + f_e) - (k_v - f_s))) <> 0 and (k_v + 2 * ((f_s - (k_v - (k_v - f_s))) + ((f_tl + f_e) - (k_v - f_s)))) - k_v = 2 * ((f_s - (k_v - (k_v - f_s))) + ((f_tl + f_e) - (k_v - f_s))) and (f_w < 0) = (((f_s - (k_v - (k_v - f_s))) + ((f_tl + f_e) - (k_v - f_s))) < 0) then k_v := k_v + 2 * ((f_s - (k_v - (k_v - f_s))) + ((f_tl + f_e) - (k_v - f_s))); end if;
    elsif k_w = 0 or k_v = 0 then
      k_v := k_w * k_v + (5.39682539762260521377e-02)::float8;
    else
      k_v := fdlibm_fma_wide(a => k_w, b => k_v, c => (5.39682539762260521377e-02)::float8);
    end if;
    k_v := k_z * k_v;
    k_s := k_z * k_x;
    f_b := k_r + k_v;
    if abs(k_s) >= 1e-144 and abs(k_s) <= 1e144 and abs(f_b) >= 1e-144 and abs(f_b) <= 1e144 and abs(k_y) <= 1e288 then
      f_p := k_s * f_b;
      f_ah := (k_s * 134217729 - (k_s * 134217729 - k_s));
      f_bh := (f_b * 134217729 - (f_b * 134217729 - f_b));
      f_e := (k_s - f_ah) * (f_b - f_bh) - (((f_p - f_ah * f_bh) - (k_s - f_ah) * f_bh) - f_ah * (f_b - f_bh));
      f_s := k_y + f_p;
      f_tl := (k_y - (f_s - (f_s - k_y))) + (f_p - (f_s - k_y));
      f_w := (f_tl - ((f_tl + f_e) - ((f_tl + f_e) - f_tl))) + (f_e - ((f_tl + f_e) - f_tl));
      k_u := f_s + (f_tl + f_e);
      if f_w <> 0 and ((f_s - (k_u - (k_u - f_s))) + ((f_tl + f_e) - (k_u - f_s))) <> 0 and (k_u + 2 * ((f_s - (k_u - (k_u - f_s))) + ((f_tl + f_e) - (k_u - f_s)))) - k_u = 2 * ((f_s - (k_u - (k_u - f_s))) + ((f_tl + f_e) - (k_u - f_s))) and (f_w < 0) = (((f_s - (k_u - (k_u - f_s))) + ((f_tl + f_e) - (k_u - f_s))) < 0) then k_u := k_u + 2 * ((f_s - (k_u - (k_u - f_s))) + ((f_tl + f_e) - (k_u - f_s))); end if;
    elsif k_s = 0 or f_b = 0 then
      k_u := k_s * f_b + k_y;
    else
      k_u := fdlibm_fma_wide(a => k_s, b => f_b, c => k_y);
    end if;
    if abs(k_z) >= 1e-144 and abs(k_z) <= 1e144 and abs(k_u) >= 1e-144 and abs(k_u) <= 1e144 and abs(k_y) <= 1e288 then
      f_p := k_z * k_u;
      f_ah := (k_z * 134217729 - (k_z * 134217729 - k_z));
      f_bh := (k_u * 134217729 - (k_u * 134217729 - k_u));
      f_e := (k_z - f_ah) * (k_u - f_bh) - (((f_p - f_ah * f_bh) - (k_z - f_ah) * f_bh) - f_ah * (k_u - f_bh));
      f_s := k_y + f_p;
      f_tl := (k_y - (f_s - (f_s - k_y))) + (f_p - (f_s - k_y));
      f_w := (f_tl - ((f_tl + f_e) - ((f_tl + f_e) - f_tl))) + (f_e - ((f_tl + f_e) - f_tl));
      k_r := f_s + (f_tl + f_e);
      if f_w <> 0 and ((f_s - (k_r - (k_r - f_s))) + ((f_tl + f_e) - (k_r - f_s))) <> 0 and (k_r + 2 * ((f_s - (k_r - (k_r - f_s))) + ((f_tl + f_e) - (k_r - f_s)))) - k_r = 2 * ((f_s - (k_r - (k_r - f_s))) + ((f_tl + f_e) - (k_r - f_s))) and (f_w < 0) = (((f_s - (k_r - (k_r - f_s))) + ((f_tl + f_e) - (k_r - f_s))) < 0) then k_r := k_r + 2 * ((f_s - (k_r - (k_r - f_s))) + ((f_tl + f_e) - (k_r - f_s))); end if;
    elsif k_z = 0 or k_u = 0 then
      k_r := k_z * k_u + k_y;
    else
      k_r := fdlibm_fma_wide(a => k_z, b => k_u, c => k_y);
    end if;
    if abs((3.33333333333334091986e-01)::float8) >= 1e-144 and abs((3.33333333333334091986e-01)::float8) <= 1e144 and abs(k_s) >= 1e-144 and abs(k_s) <= 1e144 and abs(k_r) <= 1e288 then
      f_p := (3.33333333333334091986e-01)::float8 * k_s;
      f_bh := (k_s * 134217729 - (k_s * 134217729 - k_s));
      f_e := ((3.33333333333334091986e-01)::float8 - ((3.33333333333334091986e-01)::float8 * 134217729 - ((3.33333333333334091986e-01)::float8 * 134217729 - (3.33333333333334091986e-01)::float8))) * (k_s - f_bh) - (((f_p - ((3.33333333333334091986e-01)::float8 * 134217729 - ((3.33333333333334091986e-01)::float8 * 134217729 - (3.33333333333334091986e-01)::float8)) * f_bh) - ((3.33333333333334091986e-01)::float8 - ((3.33333333333334091986e-01)::float8 * 134217729 - ((3.33333333333334091986e-01)::float8 * 134217729 - (3.33333333333334091986e-01)::float8))) * f_bh) - ((3.33333333333334091986e-01)::float8 * 134217729 - ((3.33333333333334091986e-01)::float8 * 134217729 - (3.33333333333334091986e-01)::float8)) * (k_s - f_bh));
      f_s := k_r + f_p;
      f_tl := (k_r - (f_s - (f_s - k_r))) + (f_p - (f_s - k_r));
      f_w := (f_tl - ((f_tl + f_e) - ((f_tl + f_e) - f_tl))) + (f_e - ((f_tl + f_e) - f_tl));
      k_r := f_s + (f_tl + f_e);
      if f_w <> 0 and ((f_s - (k_r - (k_r - f_s))) + ((f_tl + f_e) - (k_r - f_s))) <> 0 and (k_r + 2 * ((f_s - (k_r - (k_r - f_s))) + ((f_tl + f_e) - (k_r - f_s)))) - k_r = 2 * ((f_s - (k_r - (k_r - f_s))) + ((f_tl + f_e) - (k_r - f_s))) and (f_w < 0) = (((f_s - (k_r - (k_r - f_s))) + ((f_tl + f_e) - (k_r - f_s))) < 0) then k_r := k_r + 2 * ((f_s - (k_r - (k_r - f_s))) + ((f_tl + f_e) - (k_r - f_s))); end if;
    elsif (3.33333333333334091986e-01)::float8 = 0 or k_s = 0 then
      k_r := (3.33333333333334091986e-01)::float8 * k_s + k_r;
    else
      k_r := fdlibm_fma_wide(a => (3.33333333333334091986e-01)::float8, b => k_s, c => k_r);
    end if;
    k_w := k_x + k_r;
    if k_ix >= 0x3FE59428 then
      k_v := kiy;
      res := (1 - ((k_hx >> 30) & 2)) * (k_v - 2 * (k_x - (k_w * k_w / (k_w + k_v) - k_r)));
    elsif kiy = 1 then
      res := k_w;
    else
      k_z := (trunc((k_w) * (('{2.2250738585072014e-308,4.1045368012983762e-289,7.571533991467358e-270,1.3967014978599092e-250,2.5764595078388533e-231,4.7527289157379e-212,8.767237396033612e-193,1.617269844780878e-173,2.983336292480083e-154,5.503284107318959e-135,1.0151767349262597e-115,1.8726705418768793e-96,3.454467422037778e-77,6.372367644529809e-58,1.1754943508222875e-38,2.168404344971009e-19,4,73786976294838210000,1.361129467683754e+39,2.5108406941546723e+58,4.631683569492648e+77,8.54394814368364e+96,1.5760802478557792e+116,2.9073548971824276e+135,5.363123171977039e+154,9.893216058924181e+173,1.824976247048878e+193,3.366486976990959e+212,6.210072369202836e+231,1.1455561567389984e+251,2.113178124542661e+270,3.89812560456e+289}'::float8[])[(((1043 - ((((int8(float8send(k_w)) >> 32)::int) >> 20) & 2047)) + 1022) >> 6) + 1] * ('{1,2,4,8,16,32,64,128,256,512,1024,2048,4096,8192,16384,32768,65536,131072,262144,524288,1048576,2097152,4194304,8388608,16777216,33554432,67108864,134217728,268435456,536870912,1073741824,2147483648,4294967296,8589934592,17179869184,34359738368,68719476736,137438953472,274877906944,549755813888,1099511627776,2199023255552,4398046511104,8796093022208,17592186044416,35184372088832,70368744177664,140737488355328,281474976710656,562949953421312,1125899906842624,2251799813685248,4503599627370496,9007199254740992,18014398509481984,36028797018963970,72057594037927940,144115188075855870,288230376151711740,576460752303423500,1152921504606847000,2305843009213694000,4611686018427388000,9223372036854776000}'::float8[])[(((1043 - ((((int8(float8send(k_w)) >> 32)::int) >> 20) & 2047)) + 1022) & 63) + 1])) * (('{2.2250738585072014e-308,4.1045368012983762e-289,7.571533991467358e-270,1.3967014978599092e-250,2.5764595078388533e-231,4.7527289157379e-212,8.767237396033612e-193,1.617269844780878e-173,2.983336292480083e-154,5.503284107318959e-135,1.0151767349262597e-115,1.8726705418768793e-96,3.454467422037778e-77,6.372367644529809e-58,1.1754943508222875e-38,2.168404344971009e-19,4,73786976294838210000,1.361129467683754e+39,2.5108406941546723e+58,4.631683569492648e+77,8.54394814368364e+96,1.5760802478557792e+116,2.9073548971824276e+135,5.363123171977039e+154,9.893216058924181e+173,1.824976247048878e+193,3.366486976990959e+212,6.210072369202836e+231,1.1455561567389984e+251,2.113178124542661e+270,3.89812560456e+289}'::float8[])[(((((((int8(float8send(k_w)) >> 32)::int) >> 20) & 2047) - 1043) + 1022) >> 6) + 1] * ('{1,2,4,8,16,32,64,128,256,512,1024,2048,4096,8192,16384,32768,65536,131072,262144,524288,1048576,2097152,4194304,8388608,16777216,33554432,67108864,134217728,268435456,536870912,1073741824,2147483648,4294967296,8589934592,17179869184,34359738368,68719476736,137438953472,274877906944,549755813888,1099511627776,2199023255552,4398046511104,8796093022208,17592186044416,35184372088832,70368744177664,140737488355328,281474976710656,562949953421312,1125899906842624,2251799813685248,4503599627370496,9007199254740992,18014398509481984,36028797018963970,72057594037927940,144115188075855870,288230376151711740,576460752303423500,1152921504606847000,2305843009213694000,4611686018427388000,9223372036854776000}'::float8[])[(((((((int8(float8send(k_w)) >> 32)::int) >> 20) & 2047) - 1043) + 1022) & 63) + 1]));
      k_v := k_r - (k_z - k_x);
      k_a := -1 / k_w;
      k_t := (trunc((k_a) * (('{2.2250738585072014e-308,4.1045368012983762e-289,7.571533991467358e-270,1.3967014978599092e-250,2.5764595078388533e-231,4.7527289157379e-212,8.767237396033612e-193,1.617269844780878e-173,2.983336292480083e-154,5.503284107318959e-135,1.0151767349262597e-115,1.8726705418768793e-96,3.454467422037778e-77,6.372367644529809e-58,1.1754943508222875e-38,2.168404344971009e-19,4,73786976294838210000,1.361129467683754e+39,2.5108406941546723e+58,4.631683569492648e+77,8.54394814368364e+96,1.5760802478557792e+116,2.9073548971824276e+135,5.363123171977039e+154,9.893216058924181e+173,1.824976247048878e+193,3.366486976990959e+212,6.210072369202836e+231,1.1455561567389984e+251,2.113178124542661e+270,3.89812560456e+289}'::float8[])[(((1043 - ((((int8(float8send(k_a)) >> 32)::int) >> 20) & 2047)) + 1022) >> 6) + 1] * ('{1,2,4,8,16,32,64,128,256,512,1024,2048,4096,8192,16384,32768,65536,131072,262144,524288,1048576,2097152,4194304,8388608,16777216,33554432,67108864,134217728,268435456,536870912,1073741824,2147483648,4294967296,8589934592,17179869184,34359738368,68719476736,137438953472,274877906944,549755813888,1099511627776,2199023255552,4398046511104,8796093022208,17592186044416,35184372088832,70368744177664,140737488355328,281474976710656,562949953421312,1125899906842624,2251799813685248,4503599627370496,9007199254740992,18014398509481984,36028797018963970,72057594037927940,144115188075855870,288230376151711740,576460752303423500,1152921504606847000,2305843009213694000,4611686018427388000,9223372036854776000}'::float8[])[(((1043 - ((((int8(float8send(k_a)) >> 32)::int) >> 20) & 2047)) + 1022) & 63) + 1])) * (('{2.2250738585072014e-308,4.1045368012983762e-289,7.571533991467358e-270,1.3967014978599092e-250,2.5764595078388533e-231,4.7527289157379e-212,8.767237396033612e-193,1.617269844780878e-173,2.983336292480083e-154,5.503284107318959e-135,1.0151767349262597e-115,1.8726705418768793e-96,3.454467422037778e-77,6.372367644529809e-58,1.1754943508222875e-38,2.168404344971009e-19,4,73786976294838210000,1.361129467683754e+39,2.5108406941546723e+58,4.631683569492648e+77,8.54394814368364e+96,1.5760802478557792e+116,2.9073548971824276e+135,5.363123171977039e+154,9.893216058924181e+173,1.824976247048878e+193,3.366486976990959e+212,6.210072369202836e+231,1.1455561567389984e+251,2.113178124542661e+270,3.89812560456e+289}'::float8[])[(((((((int8(float8send(k_a)) >> 32)::int) >> 20) & 2047) - 1043) + 1022) >> 6) + 1] * ('{1,2,4,8,16,32,64,128,256,512,1024,2048,4096,8192,16384,32768,65536,131072,262144,524288,1048576,2097152,4194304,8388608,16777216,33554432,67108864,134217728,268435456,536870912,1073741824,2147483648,4294967296,8589934592,17179869184,34359738368,68719476736,137438953472,274877906944,549755813888,1099511627776,2199023255552,4398046511104,8796093022208,17592186044416,35184372088832,70368744177664,140737488355328,281474976710656,562949953421312,1125899906842624,2251799813685248,4503599627370496,9007199254740992,18014398509481984,36028797018963970,72057594037927940,144115188075855870,288230376151711740,576460752303423500,1152921504606847000,2305843009213694000,4611686018427388000,9223372036854776000}'::float8[])[(((((((int8(float8send(k_a)) >> 32)::int) >> 20) & 2047) - 1043) + 1022) & 63) + 1]));
      if abs(k_t) >= 1e-144 and abs(k_t) <= 1e144 and abs(k_z) >= 1e-144 and abs(k_z) <= 1e144 and abs((1)::float8) <= 1e288 then
        f_p := k_t * k_z;
        f_ah := (k_t * 134217729 - (k_t * 134217729 - k_t));
        f_bh := (k_z * 134217729 - (k_z * 134217729 - k_z));
        f_e := (k_t - f_ah) * (k_z - f_bh) - (((f_p - f_ah * f_bh) - (k_t - f_ah) * f_bh) - f_ah * (k_z - f_bh));
        f_s := (1)::float8 + f_p;
        f_tl := ((1)::float8 - (f_s - (f_s - (1)::float8))) + (f_p - (f_s - (1)::float8));
        f_w := (f_tl - ((f_tl + f_e) - ((f_tl + f_e) - f_tl))) + (f_e - ((f_tl + f_e) - f_tl));
        k_s := f_s + (f_tl + f_e);
        if f_w <> 0 and ((f_s - (k_s - (k_s - f_s))) + ((f_tl + f_e) - (k_s - f_s))) <> 0 and (k_s + 2 * ((f_s - (k_s - (k_s - f_s))) + ((f_tl + f_e) - (k_s - f_s)))) - k_s = 2 * ((f_s - (k_s - (k_s - f_s))) + ((f_tl + f_e) - (k_s - f_s))) and (f_w < 0) = (((f_s - (k_s - (k_s - f_s))) + ((f_tl + f_e) - (k_s - f_s))) < 0) then k_s := k_s + 2 * ((f_s - (k_s - (k_s - f_s))) + ((f_tl + f_e) - (k_s - f_s))); end if;
      elsif k_t = 0 or k_z = 0 then
        k_s := k_t * k_z + (1)::float8;
      else
        k_s := fdlibm_fma_wide(a => k_t, b => k_z, c => (1)::float8);
      end if;
      if abs(k_t) >= 1e-144 and abs(k_t) <= 1e144 and abs(k_v) >= 1e-144 and abs(k_v) <= 1e144 and abs(k_s) <= 1e288 then
        f_p := k_t * k_v;
        f_ah := (k_t * 134217729 - (k_t * 134217729 - k_t));
        f_bh := (k_v * 134217729 - (k_v * 134217729 - k_v));
        f_e := (k_t - f_ah) * (k_v - f_bh) - (((f_p - f_ah * f_bh) - (k_t - f_ah) * f_bh) - f_ah * (k_v - f_bh));
        f_s := k_s + f_p;
        f_tl := (k_s - (f_s - (f_s - k_s))) + (f_p - (f_s - k_s));
        f_w := (f_tl - ((f_tl + f_e) - ((f_tl + f_e) - f_tl))) + (f_e - ((f_tl + f_e) - f_tl));
        k_u := f_s + (f_tl + f_e);
        if f_w <> 0 and ((f_s - (k_u - (k_u - f_s))) + ((f_tl + f_e) - (k_u - f_s))) <> 0 and (k_u + 2 * ((f_s - (k_u - (k_u - f_s))) + ((f_tl + f_e) - (k_u - f_s)))) - k_u = 2 * ((f_s - (k_u - (k_u - f_s))) + ((f_tl + f_e) - (k_u - f_s))) and (f_w < 0) = (((f_s - (k_u - (k_u - f_s))) + ((f_tl + f_e) - (k_u - f_s))) < 0) then k_u := k_u + 2 * ((f_s - (k_u - (k_u - f_s))) + ((f_tl + f_e) - (k_u - f_s))); end if;
      elsif k_t = 0 or k_v = 0 then
        k_u := k_t * k_v + k_s;
      else
        k_u := fdlibm_fma_wide(a => k_t, b => k_v, c => k_s);
      end if;
      if abs(k_a) >= 1e-144 and abs(k_a) <= 1e144 and abs(k_u) >= 1e-144 and abs(k_u) <= 1e144 and abs(k_t) <= 1e288 then
        f_p := k_a * k_u;
        f_ah := (k_a * 134217729 - (k_a * 134217729 - k_a));
        f_bh := (k_u * 134217729 - (k_u * 134217729 - k_u));
        f_e := (k_a - f_ah) * (k_u - f_bh) - (((f_p - f_ah * f_bh) - (k_a - f_ah) * f_bh) - f_ah * (k_u - f_bh));
        f_s := k_t + f_p;
        f_tl := (k_t - (f_s - (f_s - k_t))) + (f_p - (f_s - k_t));
        f_w := (f_tl - ((f_tl + f_e) - ((f_tl + f_e) - f_tl))) + (f_e - ((f_tl + f_e) - f_tl));
        res := f_s + (f_tl + f_e);
        if f_w <> 0 and ((f_s - (res - (res - f_s))) + ((f_tl + f_e) - (res - f_s))) <> 0 and (res + 2 * ((f_s - (res - (res - f_s))) + ((f_tl + f_e) - (res - f_s)))) - res = 2 * ((f_s - (res - (res - f_s))) + ((f_tl + f_e) - (res - f_s))) and (f_w < 0) = (((f_s - (res - (res - f_s))) + ((f_tl + f_e) - (res - f_s))) < 0) then res := res + 2 * ((f_s - (res - (res - f_s))) + ((f_tl + f_e) - (res - f_s))); end if;
      elsif k_a = 0 or k_u = 0 then
        res := k_a * k_u + k_t;
      else
        res := fdlibm_fma_wide(a => k_a, b => k_u, c => k_t);
      end if;
    end if;
  end if;

    return res;
  end if;
  if (n & 1) = (case when 1 = 0 then 0 else 1 end) then
  k_ix := (int8(float8send(y0)) >> 32)::int & 2147483647;
  if k_ix < 0x3E400000 then
    res := y0;
  else
    k_z := y0 * y0;
    k_v := k_z * y0;
    if abs(k_z) >= 1e-144 and abs(k_z) <= 1e144 and abs((1.58969099521155010221e-10)::float8) >= 1e-144 and abs((1.58969099521155010221e-10)::float8) <= 1e144 and abs((-2.50507602534068634195e-08)::float8) <= 1e288 then
      f_p := k_z * (1.58969099521155010221e-10)::float8;
      f_ah := (k_z * 134217729 - (k_z * 134217729 - k_z));
      f_e := (k_z - f_ah) * ((1.58969099521155010221e-10)::float8 - ((1.58969099521155010221e-10)::float8 * 134217729 - ((1.58969099521155010221e-10)::float8 * 134217729 - (1.58969099521155010221e-10)::float8))) - (((f_p - f_ah * ((1.58969099521155010221e-10)::float8 * 134217729 - ((1.58969099521155010221e-10)::float8 * 134217729 - (1.58969099521155010221e-10)::float8))) - (k_z - f_ah) * ((1.58969099521155010221e-10)::float8 * 134217729 - ((1.58969099521155010221e-10)::float8 * 134217729 - (1.58969099521155010221e-10)::float8))) - f_ah * ((1.58969099521155010221e-10)::float8 - ((1.58969099521155010221e-10)::float8 * 134217729 - ((1.58969099521155010221e-10)::float8 * 134217729 - (1.58969099521155010221e-10)::float8))));
      f_s := (-2.50507602534068634195e-08)::float8 + f_p;
      f_tl := ((-2.50507602534068634195e-08)::float8 - (f_s - (f_s - (-2.50507602534068634195e-08)::float8))) + (f_p - (f_s - (-2.50507602534068634195e-08)::float8));
      f_w := (f_tl - ((f_tl + f_e) - ((f_tl + f_e) - f_tl))) + (f_e - ((f_tl + f_e) - f_tl));
      k_r := f_s + (f_tl + f_e);
      if f_w <> 0 and ((f_s - (k_r - (k_r - f_s))) + ((f_tl + f_e) - (k_r - f_s))) <> 0 and (k_r + 2 * ((f_s - (k_r - (k_r - f_s))) + ((f_tl + f_e) - (k_r - f_s)))) - k_r = 2 * ((f_s - (k_r - (k_r - f_s))) + ((f_tl + f_e) - (k_r - f_s))) and (f_w < 0) = (((f_s - (k_r - (k_r - f_s))) + ((f_tl + f_e) - (k_r - f_s))) < 0) then k_r := k_r + 2 * ((f_s - (k_r - (k_r - f_s))) + ((f_tl + f_e) - (k_r - f_s))); end if;
    elsif k_z = 0 or (1.58969099521155010221e-10)::float8 = 0 then
      k_r := k_z * (1.58969099521155010221e-10)::float8 + (-2.50507602534068634195e-08)::float8;
    else
      k_r := fdlibm_fma_wide(a => k_z, b => (1.58969099521155010221e-10)::float8, c => (-2.50507602534068634195e-08)::float8);
    end if;
    if abs(k_z) >= 1e-144 and abs(k_z) <= 1e144 and abs(k_r) >= 1e-144 and abs(k_r) <= 1e144 and abs((2.75573137070700676789e-06)::float8) <= 1e288 then
      f_p := k_z * k_r;
      f_ah := (k_z * 134217729 - (k_z * 134217729 - k_z));
      f_bh := (k_r * 134217729 - (k_r * 134217729 - k_r));
      f_e := (k_z - f_ah) * (k_r - f_bh) - (((f_p - f_ah * f_bh) - (k_z - f_ah) * f_bh) - f_ah * (k_r - f_bh));
      f_s := (2.75573137070700676789e-06)::float8 + f_p;
      f_tl := ((2.75573137070700676789e-06)::float8 - (f_s - (f_s - (2.75573137070700676789e-06)::float8))) + (f_p - (f_s - (2.75573137070700676789e-06)::float8));
      f_w := (f_tl - ((f_tl + f_e) - ((f_tl + f_e) - f_tl))) + (f_e - ((f_tl + f_e) - f_tl));
      k_r := f_s + (f_tl + f_e);
      if f_w <> 0 and ((f_s - (k_r - (k_r - f_s))) + ((f_tl + f_e) - (k_r - f_s))) <> 0 and (k_r + 2 * ((f_s - (k_r - (k_r - f_s))) + ((f_tl + f_e) - (k_r - f_s)))) - k_r = 2 * ((f_s - (k_r - (k_r - f_s))) + ((f_tl + f_e) - (k_r - f_s))) and (f_w < 0) = (((f_s - (k_r - (k_r - f_s))) + ((f_tl + f_e) - (k_r - f_s))) < 0) then k_r := k_r + 2 * ((f_s - (k_r - (k_r - f_s))) + ((f_tl + f_e) - (k_r - f_s))); end if;
    elsif k_z = 0 or k_r = 0 then
      k_r := k_z * k_r + (2.75573137070700676789e-06)::float8;
    else
      k_r := fdlibm_fma_wide(a => k_z, b => k_r, c => (2.75573137070700676789e-06)::float8);
    end if;
    if abs(k_z) >= 1e-144 and abs(k_z) <= 1e144 and abs(k_r) >= 1e-144 and abs(k_r) <= 1e144 and abs((-1.98412698298579493134e-04)::float8) <= 1e288 then
      f_p := k_z * k_r;
      f_ah := (k_z * 134217729 - (k_z * 134217729 - k_z));
      f_bh := (k_r * 134217729 - (k_r * 134217729 - k_r));
      f_e := (k_z - f_ah) * (k_r - f_bh) - (((f_p - f_ah * f_bh) - (k_z - f_ah) * f_bh) - f_ah * (k_r - f_bh));
      f_s := (-1.98412698298579493134e-04)::float8 + f_p;
      f_tl := ((-1.98412698298579493134e-04)::float8 - (f_s - (f_s - (-1.98412698298579493134e-04)::float8))) + (f_p - (f_s - (-1.98412698298579493134e-04)::float8));
      f_w := (f_tl - ((f_tl + f_e) - ((f_tl + f_e) - f_tl))) + (f_e - ((f_tl + f_e) - f_tl));
      k_r := f_s + (f_tl + f_e);
      if f_w <> 0 and ((f_s - (k_r - (k_r - f_s))) + ((f_tl + f_e) - (k_r - f_s))) <> 0 and (k_r + 2 * ((f_s - (k_r - (k_r - f_s))) + ((f_tl + f_e) - (k_r - f_s)))) - k_r = 2 * ((f_s - (k_r - (k_r - f_s))) + ((f_tl + f_e) - (k_r - f_s))) and (f_w < 0) = (((f_s - (k_r - (k_r - f_s))) + ((f_tl + f_e) - (k_r - f_s))) < 0) then k_r := k_r + 2 * ((f_s - (k_r - (k_r - f_s))) + ((f_tl + f_e) - (k_r - f_s))); end if;
    elsif k_z = 0 or k_r = 0 then
      k_r := k_z * k_r + (-1.98412698298579493134e-04)::float8;
    else
      k_r := fdlibm_fma_wide(a => k_z, b => k_r, c => (-1.98412698298579493134e-04)::float8);
    end if;
    if abs(k_z) >= 1e-144 and abs(k_z) <= 1e144 and abs(k_r) >= 1e-144 and abs(k_r) <= 1e144 and abs((8.33333333332248946124e-03)::float8) <= 1e288 then
      f_p := k_z * k_r;
      f_ah := (k_z * 134217729 - (k_z * 134217729 - k_z));
      f_bh := (k_r * 134217729 - (k_r * 134217729 - k_r));
      f_e := (k_z - f_ah) * (k_r - f_bh) - (((f_p - f_ah * f_bh) - (k_z - f_ah) * f_bh) - f_ah * (k_r - f_bh));
      f_s := (8.33333333332248946124e-03)::float8 + f_p;
      f_tl := ((8.33333333332248946124e-03)::float8 - (f_s - (f_s - (8.33333333332248946124e-03)::float8))) + (f_p - (f_s - (8.33333333332248946124e-03)::float8));
      f_w := (f_tl - ((f_tl + f_e) - ((f_tl + f_e) - f_tl))) + (f_e - ((f_tl + f_e) - f_tl));
      k_r := f_s + (f_tl + f_e);
      if f_w <> 0 and ((f_s - (k_r - (k_r - f_s))) + ((f_tl + f_e) - (k_r - f_s))) <> 0 and (k_r + 2 * ((f_s - (k_r - (k_r - f_s))) + ((f_tl + f_e) - (k_r - f_s)))) - k_r = 2 * ((f_s - (k_r - (k_r - f_s))) + ((f_tl + f_e) - (k_r - f_s))) and (f_w < 0) = (((f_s - (k_r - (k_r - f_s))) + ((f_tl + f_e) - (k_r - f_s))) < 0) then k_r := k_r + 2 * ((f_s - (k_r - (k_r - f_s))) + ((f_tl + f_e) - (k_r - f_s))); end if;
    elsif k_z = 0 or k_r = 0 then
      k_r := k_z * k_r + (8.33333333332248946124e-03)::float8;
    else
      k_r := fdlibm_fma_wide(a => k_z, b => k_r, c => (8.33333333332248946124e-03)::float8);
    end if;
    if kiy = 0 then
      if abs(k_z) >= 1e-144 and abs(k_z) <= 1e144 and abs(k_r) >= 1e-144 and abs(k_r) <= 1e144 and abs((-1.66666666666666324348e-01)::float8) <= 1e288 then
        f_p := k_z * k_r;
        f_ah := (k_z * 134217729 - (k_z * 134217729 - k_z));
        f_bh := (k_r * 134217729 - (k_r * 134217729 - k_r));
        f_e := (k_z - f_ah) * (k_r - f_bh) - (((f_p - f_ah * f_bh) - (k_z - f_ah) * f_bh) - f_ah * (k_r - f_bh));
        f_s := (-1.66666666666666324348e-01)::float8 + f_p;
        f_tl := ((-1.66666666666666324348e-01)::float8 - (f_s - (f_s - (-1.66666666666666324348e-01)::float8))) + (f_p - (f_s - (-1.66666666666666324348e-01)::float8));
        f_w := (f_tl - ((f_tl + f_e) - ((f_tl + f_e) - f_tl))) + (f_e - ((f_tl + f_e) - f_tl));
        k_u := f_s + (f_tl + f_e);
        if f_w <> 0 and ((f_s - (k_u - (k_u - f_s))) + ((f_tl + f_e) - (k_u - f_s))) <> 0 and (k_u + 2 * ((f_s - (k_u - (k_u - f_s))) + ((f_tl + f_e) - (k_u - f_s)))) - k_u = 2 * ((f_s - (k_u - (k_u - f_s))) + ((f_tl + f_e) - (k_u - f_s))) and (f_w < 0) = (((f_s - (k_u - (k_u - f_s))) + ((f_tl + f_e) - (k_u - f_s))) < 0) then k_u := k_u + 2 * ((f_s - (k_u - (k_u - f_s))) + ((f_tl + f_e) - (k_u - f_s))); end if;
      elsif k_z = 0 or k_r = 0 then
        k_u := k_z * k_r + (-1.66666666666666324348e-01)::float8;
      else
        k_u := fdlibm_fma_wide(a => k_z, b => k_r, c => (-1.66666666666666324348e-01)::float8);
      end if;
      if abs(k_v) >= 1e-144 and abs(k_v) <= 1e144 and abs(k_u) >= 1e-144 and abs(k_u) <= 1e144 and abs(y0) <= 1e288 then
        f_p := k_v * k_u;
        f_ah := (k_v * 134217729 - (k_v * 134217729 - k_v));
        f_bh := (k_u * 134217729 - (k_u * 134217729 - k_u));
        f_e := (k_v - f_ah) * (k_u - f_bh) - (((f_p - f_ah * f_bh) - (k_v - f_ah) * f_bh) - f_ah * (k_u - f_bh));
        f_s := y0 + f_p;
        f_tl := (y0 - (f_s - (f_s - y0))) + (f_p - (f_s - y0));
        f_w := (f_tl - ((f_tl + f_e) - ((f_tl + f_e) - f_tl))) + (f_e - ((f_tl + f_e) - f_tl));
        res := f_s + (f_tl + f_e);
        if f_w <> 0 and ((f_s - (res - (res - f_s))) + ((f_tl + f_e) - (res - f_s))) <> 0 and (res + 2 * ((f_s - (res - (res - f_s))) + ((f_tl + f_e) - (res - f_s)))) - res = 2 * ((f_s - (res - (res - f_s))) + ((f_tl + f_e) - (res - f_s))) and (f_w < 0) = (((f_s - (res - (res - f_s))) + ((f_tl + f_e) - (res - f_s))) < 0) then res := res + 2 * ((f_s - (res - (res - f_s))) + ((f_tl + f_e) - (res - f_s))); end if;
      elsif k_v = 0 or k_u = 0 then
        res := k_v * k_u + y0;
      else
        res := fdlibm_fma_wide(a => k_v, b => k_u, c => y0);
      end if;
    else
      if abs(k_z) >= 1e-144 and abs(k_z) <= 1e144 and abs((0.5 * y1 - k_v * k_r)::float8) >= 1e-144 and abs((0.5 * y1 - k_v * k_r)::float8) <= 1e144 and abs(-y1) <= 1e288 then
        f_p := k_z * (0.5 * y1 - k_v * k_r)::float8;
        f_ah := (k_z * 134217729 - (k_z * 134217729 - k_z));
        f_e := (k_z - f_ah) * ((0.5 * y1 - k_v * k_r)::float8 - ((0.5 * y1 - k_v * k_r)::float8 * 134217729 - ((0.5 * y1 - k_v * k_r)::float8 * 134217729 - (0.5 * y1 - k_v * k_r)::float8))) - (((f_p - f_ah * ((0.5 * y1 - k_v * k_r)::float8 * 134217729 - ((0.5 * y1 - k_v * k_r)::float8 * 134217729 - (0.5 * y1 - k_v * k_r)::float8))) - (k_z - f_ah) * ((0.5 * y1 - k_v * k_r)::float8 * 134217729 - ((0.5 * y1 - k_v * k_r)::float8 * 134217729 - (0.5 * y1 - k_v * k_r)::float8))) - f_ah * ((0.5 * y1 - k_v * k_r)::float8 - ((0.5 * y1 - k_v * k_r)::float8 * 134217729 - ((0.5 * y1 - k_v * k_r)::float8 * 134217729 - (0.5 * y1 - k_v * k_r)::float8))));
        f_s := -y1 + f_p;
        f_tl := (-y1 - (f_s - (f_s - -y1))) + (f_p - (f_s - -y1));
        f_w := (f_tl - ((f_tl + f_e) - ((f_tl + f_e) - f_tl))) + (f_e - ((f_tl + f_e) - f_tl));
        k_u := f_s + (f_tl + f_e);
        if f_w <> 0 and ((f_s - (k_u - (k_u - f_s))) + ((f_tl + f_e) - (k_u - f_s))) <> 0 and (k_u + 2 * ((f_s - (k_u - (k_u - f_s))) + ((f_tl + f_e) - (k_u - f_s)))) - k_u = 2 * ((f_s - (k_u - (k_u - f_s))) + ((f_tl + f_e) - (k_u - f_s))) and (f_w < 0) = (((f_s - (k_u - (k_u - f_s))) + ((f_tl + f_e) - (k_u - f_s))) < 0) then k_u := k_u + 2 * ((f_s - (k_u - (k_u - f_s))) + ((f_tl + f_e) - (k_u - f_s))); end if;
      elsif k_z = 0 or (0.5 * y1 - k_v * k_r)::float8 = 0 then
        k_u := k_z * (0.5 * y1 - k_v * k_r)::float8 + -y1;
      else
        k_u := fdlibm_fma_wide(a => k_z, b => (0.5 * y1 - k_v * k_r)::float8, c => -y1);
      end if;
      if abs(-k_v) >= 1e-144 and abs(-k_v) <= 1e144 and abs((-1.66666666666666324348e-01)::float8) >= 1e-144 and abs((-1.66666666666666324348e-01)::float8) <= 1e144 and abs(k_u) <= 1e288 then
        f_p := -k_v * (-1.66666666666666324348e-01)::float8;
        f_ah := (-k_v * 134217729 - (-k_v * 134217729 - -k_v));
        f_e := (-k_v - f_ah) * ((-1.66666666666666324348e-01)::float8 - ((-1.66666666666666324348e-01)::float8 * 134217729 - ((-1.66666666666666324348e-01)::float8 * 134217729 - (-1.66666666666666324348e-01)::float8))) - (((f_p - f_ah * ((-1.66666666666666324348e-01)::float8 * 134217729 - ((-1.66666666666666324348e-01)::float8 * 134217729 - (-1.66666666666666324348e-01)::float8))) - (-k_v - f_ah) * ((-1.66666666666666324348e-01)::float8 * 134217729 - ((-1.66666666666666324348e-01)::float8 * 134217729 - (-1.66666666666666324348e-01)::float8))) - f_ah * ((-1.66666666666666324348e-01)::float8 - ((-1.66666666666666324348e-01)::float8 * 134217729 - ((-1.66666666666666324348e-01)::float8 * 134217729 - (-1.66666666666666324348e-01)::float8))));
        f_s := k_u + f_p;
        f_tl := (k_u - (f_s - (f_s - k_u))) + (f_p - (f_s - k_u));
        f_w := (f_tl - ((f_tl + f_e) - ((f_tl + f_e) - f_tl))) + (f_e - ((f_tl + f_e) - f_tl));
        k_u := f_s + (f_tl + f_e);
        if f_w <> 0 and ((f_s - (k_u - (k_u - f_s))) + ((f_tl + f_e) - (k_u - f_s))) <> 0 and (k_u + 2 * ((f_s - (k_u - (k_u - f_s))) + ((f_tl + f_e) - (k_u - f_s)))) - k_u = 2 * ((f_s - (k_u - (k_u - f_s))) + ((f_tl + f_e) - (k_u - f_s))) and (f_w < 0) = (((f_s - (k_u - (k_u - f_s))) + ((f_tl + f_e) - (k_u - f_s))) < 0) then k_u := k_u + 2 * ((f_s - (k_u - (k_u - f_s))) + ((f_tl + f_e) - (k_u - f_s))); end if;
      elsif -k_v = 0 or (-1.66666666666666324348e-01)::float8 = 0 then
        k_u := -k_v * (-1.66666666666666324348e-01)::float8 + k_u;
      else
        k_u := fdlibm_fma_wide(a => -k_v, b => (-1.66666666666666324348e-01)::float8, c => k_u);
      end if;
      res := y0 - k_u;
    end if;
  end if;

  else
  k_ix := (int8(float8send(y0)) >> 32)::int & 2147483647;
  if k_ix < 0x3E400000 then
    res := 1;
  else
    k_z := y0 * y0;
    if abs(k_z) >= 1e-144 and abs(k_z) <= 1e144 and abs((-1.13596475577881948265e-11)::float8) >= 1e-144 and abs((-1.13596475577881948265e-11)::float8) <= 1e144 and abs((2.08757232129817482790e-09)::float8) <= 1e288 then
      f_p := k_z * (-1.13596475577881948265e-11)::float8;
      f_ah := (k_z * 134217729 - (k_z * 134217729 - k_z));
      f_e := (k_z - f_ah) * ((-1.13596475577881948265e-11)::float8 - ((-1.13596475577881948265e-11)::float8 * 134217729 - ((-1.13596475577881948265e-11)::float8 * 134217729 - (-1.13596475577881948265e-11)::float8))) - (((f_p - f_ah * ((-1.13596475577881948265e-11)::float8 * 134217729 - ((-1.13596475577881948265e-11)::float8 * 134217729 - (-1.13596475577881948265e-11)::float8))) - (k_z - f_ah) * ((-1.13596475577881948265e-11)::float8 * 134217729 - ((-1.13596475577881948265e-11)::float8 * 134217729 - (-1.13596475577881948265e-11)::float8))) - f_ah * ((-1.13596475577881948265e-11)::float8 - ((-1.13596475577881948265e-11)::float8 * 134217729 - ((-1.13596475577881948265e-11)::float8 * 134217729 - (-1.13596475577881948265e-11)::float8))));
      f_s := (2.08757232129817482790e-09)::float8 + f_p;
      f_tl := ((2.08757232129817482790e-09)::float8 - (f_s - (f_s - (2.08757232129817482790e-09)::float8))) + (f_p - (f_s - (2.08757232129817482790e-09)::float8));
      f_w := (f_tl - ((f_tl + f_e) - ((f_tl + f_e) - f_tl))) + (f_e - ((f_tl + f_e) - f_tl));
      k_r := f_s + (f_tl + f_e);
      if f_w <> 0 and ((f_s - (k_r - (k_r - f_s))) + ((f_tl + f_e) - (k_r - f_s))) <> 0 and (k_r + 2 * ((f_s - (k_r - (k_r - f_s))) + ((f_tl + f_e) - (k_r - f_s)))) - k_r = 2 * ((f_s - (k_r - (k_r - f_s))) + ((f_tl + f_e) - (k_r - f_s))) and (f_w < 0) = (((f_s - (k_r - (k_r - f_s))) + ((f_tl + f_e) - (k_r - f_s))) < 0) then k_r := k_r + 2 * ((f_s - (k_r - (k_r - f_s))) + ((f_tl + f_e) - (k_r - f_s))); end if;
    elsif k_z = 0 or (-1.13596475577881948265e-11)::float8 = 0 then
      k_r := k_z * (-1.13596475577881948265e-11)::float8 + (2.08757232129817482790e-09)::float8;
    else
      k_r := fdlibm_fma_wide(a => k_z, b => (-1.13596475577881948265e-11)::float8, c => (2.08757232129817482790e-09)::float8);
    end if;
    if abs(k_z) >= 1e-144 and abs(k_z) <= 1e144 and abs(k_r) >= 1e-144 and abs(k_r) <= 1e144 and abs((-2.75573143513906633035e-07)::float8) <= 1e288 then
      f_p := k_z * k_r;
      f_ah := (k_z * 134217729 - (k_z * 134217729 - k_z));
      f_bh := (k_r * 134217729 - (k_r * 134217729 - k_r));
      f_e := (k_z - f_ah) * (k_r - f_bh) - (((f_p - f_ah * f_bh) - (k_z - f_ah) * f_bh) - f_ah * (k_r - f_bh));
      f_s := (-2.75573143513906633035e-07)::float8 + f_p;
      f_tl := ((-2.75573143513906633035e-07)::float8 - (f_s - (f_s - (-2.75573143513906633035e-07)::float8))) + (f_p - (f_s - (-2.75573143513906633035e-07)::float8));
      f_w := (f_tl - ((f_tl + f_e) - ((f_tl + f_e) - f_tl))) + (f_e - ((f_tl + f_e) - f_tl));
      k_r := f_s + (f_tl + f_e);
      if f_w <> 0 and ((f_s - (k_r - (k_r - f_s))) + ((f_tl + f_e) - (k_r - f_s))) <> 0 and (k_r + 2 * ((f_s - (k_r - (k_r - f_s))) + ((f_tl + f_e) - (k_r - f_s)))) - k_r = 2 * ((f_s - (k_r - (k_r - f_s))) + ((f_tl + f_e) - (k_r - f_s))) and (f_w < 0) = (((f_s - (k_r - (k_r - f_s))) + ((f_tl + f_e) - (k_r - f_s))) < 0) then k_r := k_r + 2 * ((f_s - (k_r - (k_r - f_s))) + ((f_tl + f_e) - (k_r - f_s))); end if;
    elsif k_z = 0 or k_r = 0 then
      k_r := k_z * k_r + (-2.75573143513906633035e-07)::float8;
    else
      k_r := fdlibm_fma_wide(a => k_z, b => k_r, c => (-2.75573143513906633035e-07)::float8);
    end if;
    if abs(k_z) >= 1e-144 and abs(k_z) <= 1e144 and abs(k_r) >= 1e-144 and abs(k_r) <= 1e144 and abs((2.48015872894767294178e-05)::float8) <= 1e288 then
      f_p := k_z * k_r;
      f_ah := (k_z * 134217729 - (k_z * 134217729 - k_z));
      f_bh := (k_r * 134217729 - (k_r * 134217729 - k_r));
      f_e := (k_z - f_ah) * (k_r - f_bh) - (((f_p - f_ah * f_bh) - (k_z - f_ah) * f_bh) - f_ah * (k_r - f_bh));
      f_s := (2.48015872894767294178e-05)::float8 + f_p;
      f_tl := ((2.48015872894767294178e-05)::float8 - (f_s - (f_s - (2.48015872894767294178e-05)::float8))) + (f_p - (f_s - (2.48015872894767294178e-05)::float8));
      f_w := (f_tl - ((f_tl + f_e) - ((f_tl + f_e) - f_tl))) + (f_e - ((f_tl + f_e) - f_tl));
      k_r := f_s + (f_tl + f_e);
      if f_w <> 0 and ((f_s - (k_r - (k_r - f_s))) + ((f_tl + f_e) - (k_r - f_s))) <> 0 and (k_r + 2 * ((f_s - (k_r - (k_r - f_s))) + ((f_tl + f_e) - (k_r - f_s)))) - k_r = 2 * ((f_s - (k_r - (k_r - f_s))) + ((f_tl + f_e) - (k_r - f_s))) and (f_w < 0) = (((f_s - (k_r - (k_r - f_s))) + ((f_tl + f_e) - (k_r - f_s))) < 0) then k_r := k_r + 2 * ((f_s - (k_r - (k_r - f_s))) + ((f_tl + f_e) - (k_r - f_s))); end if;
    elsif k_z = 0 or k_r = 0 then
      k_r := k_z * k_r + (2.48015872894767294178e-05)::float8;
    else
      k_r := fdlibm_fma_wide(a => k_z, b => k_r, c => (2.48015872894767294178e-05)::float8);
    end if;
    if abs(k_z) >= 1e-144 and abs(k_z) <= 1e144 and abs(k_r) >= 1e-144 and abs(k_r) <= 1e144 and abs((-1.38888888888741095749e-03)::float8) <= 1e288 then
      f_p := k_z * k_r;
      f_ah := (k_z * 134217729 - (k_z * 134217729 - k_z));
      f_bh := (k_r * 134217729 - (k_r * 134217729 - k_r));
      f_e := (k_z - f_ah) * (k_r - f_bh) - (((f_p - f_ah * f_bh) - (k_z - f_ah) * f_bh) - f_ah * (k_r - f_bh));
      f_s := (-1.38888888888741095749e-03)::float8 + f_p;
      f_tl := ((-1.38888888888741095749e-03)::float8 - (f_s - (f_s - (-1.38888888888741095749e-03)::float8))) + (f_p - (f_s - (-1.38888888888741095749e-03)::float8));
      f_w := (f_tl - ((f_tl + f_e) - ((f_tl + f_e) - f_tl))) + (f_e - ((f_tl + f_e) - f_tl));
      k_r := f_s + (f_tl + f_e);
      if f_w <> 0 and ((f_s - (k_r - (k_r - f_s))) + ((f_tl + f_e) - (k_r - f_s))) <> 0 and (k_r + 2 * ((f_s - (k_r - (k_r - f_s))) + ((f_tl + f_e) - (k_r - f_s)))) - k_r = 2 * ((f_s - (k_r - (k_r - f_s))) + ((f_tl + f_e) - (k_r - f_s))) and (f_w < 0) = (((f_s - (k_r - (k_r - f_s))) + ((f_tl + f_e) - (k_r - f_s))) < 0) then k_r := k_r + 2 * ((f_s - (k_r - (k_r - f_s))) + ((f_tl + f_e) - (k_r - f_s))); end if;
    elsif k_z = 0 or k_r = 0 then
      k_r := k_z * k_r + (-1.38888888888741095749e-03)::float8;
    else
      k_r := fdlibm_fma_wide(a => k_z, b => k_r, c => (-1.38888888888741095749e-03)::float8);
    end if;
    if abs(k_z) >= 1e-144 and abs(k_z) <= 1e144 and abs(k_r) >= 1e-144 and abs(k_r) <= 1e144 and abs((4.16666666666666019037e-02)::float8) <= 1e288 then
      f_p := k_z * k_r;
      f_ah := (k_z * 134217729 - (k_z * 134217729 - k_z));
      f_bh := (k_r * 134217729 - (k_r * 134217729 - k_r));
      f_e := (k_z - f_ah) * (k_r - f_bh) - (((f_p - f_ah * f_bh) - (k_z - f_ah) * f_bh) - f_ah * (k_r - f_bh));
      f_s := (4.16666666666666019037e-02)::float8 + f_p;
      f_tl := ((4.16666666666666019037e-02)::float8 - (f_s - (f_s - (4.16666666666666019037e-02)::float8))) + (f_p - (f_s - (4.16666666666666019037e-02)::float8));
      f_w := (f_tl - ((f_tl + f_e) - ((f_tl + f_e) - f_tl))) + (f_e - ((f_tl + f_e) - f_tl));
      k_r := f_s + (f_tl + f_e);
      if f_w <> 0 and ((f_s - (k_r - (k_r - f_s))) + ((f_tl + f_e) - (k_r - f_s))) <> 0 and (k_r + 2 * ((f_s - (k_r - (k_r - f_s))) + ((f_tl + f_e) - (k_r - f_s)))) - k_r = 2 * ((f_s - (k_r - (k_r - f_s))) + ((f_tl + f_e) - (k_r - f_s))) and (f_w < 0) = (((f_s - (k_r - (k_r - f_s))) + ((f_tl + f_e) - (k_r - f_s))) < 0) then k_r := k_r + 2 * ((f_s - (k_r - (k_r - f_s))) + ((f_tl + f_e) - (k_r - f_s))); end if;
    elsif k_z = 0 or k_r = 0 then
      k_r := k_z * k_r + (4.16666666666666019037e-02)::float8;
    else
      k_r := fdlibm_fma_wide(a => k_z, b => k_r, c => (4.16666666666666019037e-02)::float8);
    end if;
    k_r := k_z * k_r;
    f_c := -(y0 * y1);
    if abs(k_z) >= 1e-144 and abs(k_z) <= 1e144 and abs(k_r) >= 1e-144 and abs(k_r) <= 1e144 and abs(f_c) <= 1e288 then
      f_p := k_z * k_r;
      f_ah := (k_z * 134217729 - (k_z * 134217729 - k_z));
      f_bh := (k_r * 134217729 - (k_r * 134217729 - k_r));
      f_e := (k_z - f_ah) * (k_r - f_bh) - (((f_p - f_ah * f_bh) - (k_z - f_ah) * f_bh) - f_ah * (k_r - f_bh));
      f_s := f_c + f_p;
      f_tl := (f_c - (f_s - (f_s - f_c))) + (f_p - (f_s - f_c));
      f_w := (f_tl - ((f_tl + f_e) - ((f_tl + f_e) - f_tl))) + (f_e - ((f_tl + f_e) - f_tl));
      k_u := f_s + (f_tl + f_e);
      if f_w <> 0 and ((f_s - (k_u - (k_u - f_s))) + ((f_tl + f_e) - (k_u - f_s))) <> 0 and (k_u + 2 * ((f_s - (k_u - (k_u - f_s))) + ((f_tl + f_e) - (k_u - f_s)))) - k_u = 2 * ((f_s - (k_u - (k_u - f_s))) + ((f_tl + f_e) - (k_u - f_s))) and (f_w < 0) = (((f_s - (k_u - (k_u - f_s))) + ((f_tl + f_e) - (k_u - f_s))) < 0) then k_u := k_u + 2 * ((f_s - (k_u - (k_u - f_s))) + ((f_tl + f_e) - (k_u - f_s))); end if;
    elsif k_z = 0 or k_r = 0 then
      k_u := k_z * k_r + f_c;
    else
      k_u := fdlibm_fma_wide(a => k_z, b => k_r, c => f_c);
    end if;
    if k_ix < 0x3FD33333 then
      res := 1 - (0.5 * k_z - k_u);
    else
      k_q := case when k_ix > 0x3FE90000 then 0.28125 else (trunc((abs(y0)) * (('{2.2250738585072014e-308,4.1045368012983762e-289,7.571533991467358e-270,1.3967014978599092e-250,2.5764595078388533e-231,4.7527289157379e-212,8.767237396033612e-193,1.617269844780878e-173,2.983336292480083e-154,5.503284107318959e-135,1.0151767349262597e-115,1.8726705418768793e-96,3.454467422037778e-77,6.372367644529809e-58,1.1754943508222875e-38,2.168404344971009e-19,4,73786976294838210000,1.361129467683754e+39,2.5108406941546723e+58,4.631683569492648e+77,8.54394814368364e+96,1.5760802478557792e+116,2.9073548971824276e+135,5.363123171977039e+154,9.893216058924181e+173,1.824976247048878e+193,3.366486976990959e+212,6.210072369202836e+231,1.1455561567389984e+251,2.113178124542661e+270,3.89812560456e+289}'::float8[])[(((1043 - (((k_ix) >> 20) & 2047)) + 1022) >> 6) + 1] * ('{1,2,4,8,16,32,64,128,256,512,1024,2048,4096,8192,16384,32768,65536,131072,262144,524288,1048576,2097152,4194304,8388608,16777216,33554432,67108864,134217728,268435456,536870912,1073741824,2147483648,4294967296,8589934592,17179869184,34359738368,68719476736,137438953472,274877906944,549755813888,1099511627776,2199023255552,4398046511104,8796093022208,17592186044416,35184372088832,70368744177664,140737488355328,281474976710656,562949953421312,1125899906842624,2251799813685248,4503599627370496,9007199254740992,18014398509481984,36028797018963970,72057594037927940,144115188075855870,288230376151711740,576460752303423500,1152921504606847000,2305843009213694000,4611686018427388000,9223372036854776000}'::float8[])[(((1043 - (((k_ix) >> 20) & 2047)) + 1022) & 63) + 1])) * (('{2.2250738585072014e-308,4.1045368012983762e-289,7.571533991467358e-270,1.3967014978599092e-250,2.5764595078388533e-231,4.7527289157379e-212,8.767237396033612e-193,1.617269844780878e-173,2.983336292480083e-154,5.503284107318959e-135,1.0151767349262597e-115,1.8726705418768793e-96,3.454467422037778e-77,6.372367644529809e-58,1.1754943508222875e-38,2.168404344971009e-19,4,73786976294838210000,1.361129467683754e+39,2.5108406941546723e+58,4.631683569492648e+77,8.54394814368364e+96,1.5760802478557792e+116,2.9073548971824276e+135,5.363123171977039e+154,9.893216058924181e+173,1.824976247048878e+193,3.366486976990959e+212,6.210072369202836e+231,1.1455561567389984e+251,2.113178124542661e+270,3.89812560456e+289}'::float8[])[((((((k_ix) >> 20) & 2047) - 1043) + 1022) >> 6) + 1] * ('{1,2,4,8,16,32,64,128,256,512,1024,2048,4096,8192,16384,32768,65536,131072,262144,524288,1048576,2097152,4194304,8388608,16777216,33554432,67108864,134217728,268435456,536870912,1073741824,2147483648,4294967296,8589934592,17179869184,34359738368,68719476736,137438953472,274877906944,549755813888,1099511627776,2199023255552,4398046511104,8796093022208,17592186044416,35184372088832,70368744177664,140737488355328,281474976710656,562949953421312,1125899906842624,2251799813685248,4503599627370496,9007199254740992,18014398509481984,36028797018963970,72057594037927940,144115188075855870,288230376151711740,576460752303423500,1152921504606847000,2305843009213694000,4611686018427388000,9223372036854776000}'::float8[])[((((((k_ix) >> 20) & 2047) - 1043) + 1022) & 63) + 1])) * 0.25 end;
      res := (1 - k_q) - ((0.5 * k_z - k_q) - k_u);
    end if;
  end if;

  end if;
  return case when (case when 1 = 0 then n else n + 1 end & 2) = 2 then -res else res end;
end $$;

-- V8's tan (ieee754.cc; Math.tan), with __ieee754_rem_pio2's reduction up to 2^19·π/2 and the kernels
-- inline. fn × pio2_1 is exact (20 by 31 bits), so its fused and unfused forms agree.
create function p3.fdlibm_tan(x float8) returns float8 language plpgsql immutable as $$
declare f_a float8; f_b float8; f_c float8; f_p float8; f_ah float8; f_bh float8; f_e float8; f_s float8; f_tl float8; f_w float8; k_ix int; k_hx int; k_x float8; k_y float8; k_z float8; k_v float8; k_r float8; k_u float8; k_q float8; k_w float8; k_a float8; k_t float8; k_s float8;
 hx int := (int8(float8send(x)) >> 32)::int; ix int := hx & 2147483647; z float8; w float8; t float8; r float8; fn float8; y0 float8; y1 float8; n int; j int; i int; u float8; res float8; kiy int;
begin
  if ix <= 0x3FE921FB then
    n := 0; y0 := x; y1 := 0; kiy := case when 2 = 0 then 0 else 1 end;
  elsif ix >= 0x7FF00000 then
    return case when x = 'NaN' then x else 'NaN'::float8 end;
  elsif ix < 0x4002D97C then
    if hx > 0 then
      z := x - 1.57079632673412561417e+00;
      if ix <> 0x3FF921FB then
        y0 := z - 6.07710050650619224932e-11;
        y1 := (z - y0) - 6.07710050650619224932e-11;
      else
        z := z - 6.07710050630396597660e-11;
        y0 := z - 2.02226624879595063154e-21;
        y1 := (z - y0) - 2.02226624879595063154e-21;
      end if;
      n := 1;
    else
      z := x + 1.57079632673412561417e+00;
      if ix <> 0x3FF921FB then
        y0 := z + 6.07710050650619224932e-11;
        y1 := (z - y0) + 6.07710050650619224932e-11;
      else
        z := z + 6.07710050630396597660e-11;
        y0 := z + 2.02226624879595063154e-21;
        y1 := (z - y0) + 2.02226624879595063154e-21;
      end if;
      n := -1;
    end if;
    kiy := case when 2 = 2 then -1 else 1 end;
  elsif ix > 0x413921FB then
    return fdlibm_trig_large(op => 2, x => x);
  else
    t := abs(x);
    if abs(t) >= 1e-144 and abs(t) <= 1e144 and abs((6.36619772367581382433e-01)::float8) >= 1e-144 and abs((6.36619772367581382433e-01)::float8) <= 1e144 and abs((0.5)::float8) <= 1e288 then
      f_p := t * (6.36619772367581382433e-01)::float8;
      f_ah := (t * 134217729 - (t * 134217729 - t));
      f_e := (t - f_ah) * ((6.36619772367581382433e-01)::float8 - ((6.36619772367581382433e-01)::float8 * 134217729 - ((6.36619772367581382433e-01)::float8 * 134217729 - (6.36619772367581382433e-01)::float8))) - (((f_p - f_ah * ((6.36619772367581382433e-01)::float8 * 134217729 - ((6.36619772367581382433e-01)::float8 * 134217729 - (6.36619772367581382433e-01)::float8))) - (t - f_ah) * ((6.36619772367581382433e-01)::float8 * 134217729 - ((6.36619772367581382433e-01)::float8 * 134217729 - (6.36619772367581382433e-01)::float8))) - f_ah * ((6.36619772367581382433e-01)::float8 - ((6.36619772367581382433e-01)::float8 * 134217729 - ((6.36619772367581382433e-01)::float8 * 134217729 - (6.36619772367581382433e-01)::float8))));
      f_s := (0.5)::float8 + f_p;
      f_tl := ((0.5)::float8 - (f_s - (f_s - (0.5)::float8))) + (f_p - (f_s - (0.5)::float8));
      f_w := (f_tl - ((f_tl + f_e) - ((f_tl + f_e) - f_tl))) + (f_e - ((f_tl + f_e) - f_tl));
      u := f_s + (f_tl + f_e);
      if f_w <> 0 and ((f_s - (u - (u - f_s))) + ((f_tl + f_e) - (u - f_s))) <> 0 and (u + 2 * ((f_s - (u - (u - f_s))) + ((f_tl + f_e) - (u - f_s)))) - u = 2 * ((f_s - (u - (u - f_s))) + ((f_tl + f_e) - (u - f_s))) and (f_w < 0) = (((f_s - (u - (u - f_s))) + ((f_tl + f_e) - (u - f_s))) < 0) then u := u + 2 * ((f_s - (u - (u - f_s))) + ((f_tl + f_e) - (u - f_s))); end if;
    elsif t = 0 or (6.36619772367581382433e-01)::float8 = 0 then
      u := t * (6.36619772367581382433e-01)::float8 + (0.5)::float8;
    else
      u := fdlibm_fma_wide(a => t, b => (6.36619772367581382433e-01)::float8, c => (0.5)::float8);
    end if;
    n := trunc(u)::int;
    fn := n;
    r := t - fn * 1.57079632673412561417e+00;
    w := fn * 6.07710050650619224932e-11;
    y0 := r - w;
    if (case when n < 32 then ix = ('{1073291771,1074340347,1074977148,1075388923,1075800698,1076025724,1076231611,1076437499,1076643386,1076849274,1076971356,1077074300,1077177244,1077280187,1077383131,1077486075,1077589019,1077691962,1077794906,1077897850,1077968460,1078019932,1078071404,1078122876,1078174348,1078225820,1078277292,1078328763,1078380235,1078431707,1078483179,1078534651}'::int[])[n] else true end) then
      j := ix >> 20;
      i := j - (((int8(float8send(y0)) >> 32)::int >> 20) & 0x7FF);
      if i > 16 then
        t := r;
        w := fn * 6.07710050630396597660e-11;
        r := t - w;
        f_c := -((t - r) - w);
        if abs(fn) >= 1e-144 and abs(fn) <= 1e144 and abs((2.02226624879595063154e-21)::float8) >= 1e-144 and abs((2.02226624879595063154e-21)::float8) <= 1e144 and abs(f_c) <= 1e288 then
          f_p := fn * (2.02226624879595063154e-21)::float8;
          f_ah := (fn * 134217729 - (fn * 134217729 - fn));
          f_e := (fn - f_ah) * ((2.02226624879595063154e-21)::float8 - ((2.02226624879595063154e-21)::float8 * 134217729 - ((2.02226624879595063154e-21)::float8 * 134217729 - (2.02226624879595063154e-21)::float8))) - (((f_p - f_ah * ((2.02226624879595063154e-21)::float8 * 134217729 - ((2.02226624879595063154e-21)::float8 * 134217729 - (2.02226624879595063154e-21)::float8))) - (fn - f_ah) * ((2.02226624879595063154e-21)::float8 * 134217729 - ((2.02226624879595063154e-21)::float8 * 134217729 - (2.02226624879595063154e-21)::float8))) - f_ah * ((2.02226624879595063154e-21)::float8 - ((2.02226624879595063154e-21)::float8 * 134217729 - ((2.02226624879595063154e-21)::float8 * 134217729 - (2.02226624879595063154e-21)::float8))));
          f_s := f_c + f_p;
          f_tl := (f_c - (f_s - (f_s - f_c))) + (f_p - (f_s - f_c));
          f_w := (f_tl - ((f_tl + f_e) - ((f_tl + f_e) - f_tl))) + (f_e - ((f_tl + f_e) - f_tl));
          w := f_s + (f_tl + f_e);
          if f_w <> 0 and ((f_s - (w - (w - f_s))) + ((f_tl + f_e) - (w - f_s))) <> 0 and (w + 2 * ((f_s - (w - (w - f_s))) + ((f_tl + f_e) - (w - f_s)))) - w = 2 * ((f_s - (w - (w - f_s))) + ((f_tl + f_e) - (w - f_s))) and (f_w < 0) = (((f_s - (w - (w - f_s))) + ((f_tl + f_e) - (w - f_s))) < 0) then w := w + 2 * ((f_s - (w - (w - f_s))) + ((f_tl + f_e) - (w - f_s))); end if;
        elsif fn = 0 or (2.02226624879595063154e-21)::float8 = 0 then
          w := fn * (2.02226624879595063154e-21)::float8 + f_c;
        else
          w := fdlibm_fma_wide(a => fn, b => (2.02226624879595063154e-21)::float8, c => f_c);
        end if;
        y0 := r - w;
        i := j - (((int8(float8send(y0)) >> 32)::int >> 20) & 0x7FF);
        if i > 49 then
          t := r;
          w := fn * 2.02226624871116645580e-21;
          r := t - w;
          f_c := -((t - r) - w);
          if abs(fn) >= 1e-144 and abs(fn) <= 1e144 and abs((8.47842766036889956997e-32)::float8) >= 1e-144 and abs((8.47842766036889956997e-32)::float8) <= 1e144 and abs(f_c) <= 1e288 then
            f_p := fn * (8.47842766036889956997e-32)::float8;
            f_ah := (fn * 134217729 - (fn * 134217729 - fn));
            f_e := (fn - f_ah) * ((8.47842766036889956997e-32)::float8 - ((8.47842766036889956997e-32)::float8 * 134217729 - ((8.47842766036889956997e-32)::float8 * 134217729 - (8.47842766036889956997e-32)::float8))) - (((f_p - f_ah * ((8.47842766036889956997e-32)::float8 * 134217729 - ((8.47842766036889956997e-32)::float8 * 134217729 - (8.47842766036889956997e-32)::float8))) - (fn - f_ah) * ((8.47842766036889956997e-32)::float8 * 134217729 - ((8.47842766036889956997e-32)::float8 * 134217729 - (8.47842766036889956997e-32)::float8))) - f_ah * ((8.47842766036889956997e-32)::float8 - ((8.47842766036889956997e-32)::float8 * 134217729 - ((8.47842766036889956997e-32)::float8 * 134217729 - (8.47842766036889956997e-32)::float8))));
            f_s := f_c + f_p;
            f_tl := (f_c - (f_s - (f_s - f_c))) + (f_p - (f_s - f_c));
            f_w := (f_tl - ((f_tl + f_e) - ((f_tl + f_e) - f_tl))) + (f_e - ((f_tl + f_e) - f_tl));
            w := f_s + (f_tl + f_e);
            if f_w <> 0 and ((f_s - (w - (w - f_s))) + ((f_tl + f_e) - (w - f_s))) <> 0 and (w + 2 * ((f_s - (w - (w - f_s))) + ((f_tl + f_e) - (w - f_s)))) - w = 2 * ((f_s - (w - (w - f_s))) + ((f_tl + f_e) - (w - f_s))) and (f_w < 0) = (((f_s - (w - (w - f_s))) + ((f_tl + f_e) - (w - f_s))) < 0) then w := w + 2 * ((f_s - (w - (w - f_s))) + ((f_tl + f_e) - (w - f_s))); end if;
          elsif fn = 0 or (8.47842766036889956997e-32)::float8 = 0 then
            w := fn * (8.47842766036889956997e-32)::float8 + f_c;
          else
            w := fdlibm_fma_wide(a => fn, b => (8.47842766036889956997e-32)::float8, c => f_c);
          end if;
          y0 := r - w;
        end if;
      end if;
    end if;
    y1 := (r - y0) - w;
    if hx < 0 then n := -n; y0 := -y0; y1 := -y1; end if;
    kiy := case when 2 = 2 then 1 - ((n & 1) << 1) else 1 end;
  end if;
  -- the kernel of n mod 4 (sin: S C -S -C; cos: C -S -C S; tan: T, -1/T by the parity of n)
  if 2 = 2 then
  k_x := y0;
  k_y := y1;
  k_hx := (int8(float8send(k_x)) >> 32)::int;
  k_ix := k_hx & 2147483647;
  if k_ix < 0x3E300000 then
    if k_ix = 0 and (int8(float8send(k_x)) & 4294967295) = 0 and kiy = -1 then
      res := 'Infinity';
    elsif kiy = 1 then
      res := k_x;
    else
      k_w := k_x + k_y;
      k_z := (trunc((k_w) * (('{2.2250738585072014e-308,4.1045368012983762e-289,7.571533991467358e-270,1.3967014978599092e-250,2.5764595078388533e-231,4.7527289157379e-212,8.767237396033612e-193,1.617269844780878e-173,2.983336292480083e-154,5.503284107318959e-135,1.0151767349262597e-115,1.8726705418768793e-96,3.454467422037778e-77,6.372367644529809e-58,1.1754943508222875e-38,2.168404344971009e-19,4,73786976294838210000,1.361129467683754e+39,2.5108406941546723e+58,4.631683569492648e+77,8.54394814368364e+96,1.5760802478557792e+116,2.9073548971824276e+135,5.363123171977039e+154,9.893216058924181e+173,1.824976247048878e+193,3.366486976990959e+212,6.210072369202836e+231,1.1455561567389984e+251,2.113178124542661e+270,3.89812560456e+289}'::float8[])[(((1043 - ((((int8(float8send(k_w)) >> 32)::int) >> 20) & 2047)) + 1022) >> 6) + 1] * ('{1,2,4,8,16,32,64,128,256,512,1024,2048,4096,8192,16384,32768,65536,131072,262144,524288,1048576,2097152,4194304,8388608,16777216,33554432,67108864,134217728,268435456,536870912,1073741824,2147483648,4294967296,8589934592,17179869184,34359738368,68719476736,137438953472,274877906944,549755813888,1099511627776,2199023255552,4398046511104,8796093022208,17592186044416,35184372088832,70368744177664,140737488355328,281474976710656,562949953421312,1125899906842624,2251799813685248,4503599627370496,9007199254740992,18014398509481984,36028797018963970,72057594037927940,144115188075855870,288230376151711740,576460752303423500,1152921504606847000,2305843009213694000,4611686018427388000,9223372036854776000}'::float8[])[(((1043 - ((((int8(float8send(k_w)) >> 32)::int) >> 20) & 2047)) + 1022) & 63) + 1])) * (('{2.2250738585072014e-308,4.1045368012983762e-289,7.571533991467358e-270,1.3967014978599092e-250,2.5764595078388533e-231,4.7527289157379e-212,8.767237396033612e-193,1.617269844780878e-173,2.983336292480083e-154,5.503284107318959e-135,1.0151767349262597e-115,1.8726705418768793e-96,3.454467422037778e-77,6.372367644529809e-58,1.1754943508222875e-38,2.168404344971009e-19,4,73786976294838210000,1.361129467683754e+39,2.5108406941546723e+58,4.631683569492648e+77,8.54394814368364e+96,1.5760802478557792e+116,2.9073548971824276e+135,5.363123171977039e+154,9.893216058924181e+173,1.824976247048878e+193,3.366486976990959e+212,6.210072369202836e+231,1.1455561567389984e+251,2.113178124542661e+270,3.89812560456e+289}'::float8[])[(((((((int8(float8send(k_w)) >> 32)::int) >> 20) & 2047) - 1043) + 1022) >> 6) + 1] * ('{1,2,4,8,16,32,64,128,256,512,1024,2048,4096,8192,16384,32768,65536,131072,262144,524288,1048576,2097152,4194304,8388608,16777216,33554432,67108864,134217728,268435456,536870912,1073741824,2147483648,4294967296,8589934592,17179869184,34359738368,68719476736,137438953472,274877906944,549755813888,1099511627776,2199023255552,4398046511104,8796093022208,17592186044416,35184372088832,70368744177664,140737488355328,281474976710656,562949953421312,1125899906842624,2251799813685248,4503599627370496,9007199254740992,18014398509481984,36028797018963970,72057594037927940,144115188075855870,288230376151711740,576460752303423500,1152921504606847000,2305843009213694000,4611686018427388000,9223372036854776000}'::float8[])[(((((((int8(float8send(k_w)) >> 32)::int) >> 20) & 2047) - 1043) + 1022) & 63) + 1]));
      k_v := k_y - (k_z - k_x);
      k_a := -1 / k_w;
      k_t := (trunc((k_a) * (('{2.2250738585072014e-308,4.1045368012983762e-289,7.571533991467358e-270,1.3967014978599092e-250,2.5764595078388533e-231,4.7527289157379e-212,8.767237396033612e-193,1.617269844780878e-173,2.983336292480083e-154,5.503284107318959e-135,1.0151767349262597e-115,1.8726705418768793e-96,3.454467422037778e-77,6.372367644529809e-58,1.1754943508222875e-38,2.168404344971009e-19,4,73786976294838210000,1.361129467683754e+39,2.5108406941546723e+58,4.631683569492648e+77,8.54394814368364e+96,1.5760802478557792e+116,2.9073548971824276e+135,5.363123171977039e+154,9.893216058924181e+173,1.824976247048878e+193,3.366486976990959e+212,6.210072369202836e+231,1.1455561567389984e+251,2.113178124542661e+270,3.89812560456e+289}'::float8[])[(((1043 - ((((int8(float8send(k_a)) >> 32)::int) >> 20) & 2047)) + 1022) >> 6) + 1] * ('{1,2,4,8,16,32,64,128,256,512,1024,2048,4096,8192,16384,32768,65536,131072,262144,524288,1048576,2097152,4194304,8388608,16777216,33554432,67108864,134217728,268435456,536870912,1073741824,2147483648,4294967296,8589934592,17179869184,34359738368,68719476736,137438953472,274877906944,549755813888,1099511627776,2199023255552,4398046511104,8796093022208,17592186044416,35184372088832,70368744177664,140737488355328,281474976710656,562949953421312,1125899906842624,2251799813685248,4503599627370496,9007199254740992,18014398509481984,36028797018963970,72057594037927940,144115188075855870,288230376151711740,576460752303423500,1152921504606847000,2305843009213694000,4611686018427388000,9223372036854776000}'::float8[])[(((1043 - ((((int8(float8send(k_a)) >> 32)::int) >> 20) & 2047)) + 1022) & 63) + 1])) * (('{2.2250738585072014e-308,4.1045368012983762e-289,7.571533991467358e-270,1.3967014978599092e-250,2.5764595078388533e-231,4.7527289157379e-212,8.767237396033612e-193,1.617269844780878e-173,2.983336292480083e-154,5.503284107318959e-135,1.0151767349262597e-115,1.8726705418768793e-96,3.454467422037778e-77,6.372367644529809e-58,1.1754943508222875e-38,2.168404344971009e-19,4,73786976294838210000,1.361129467683754e+39,2.5108406941546723e+58,4.631683569492648e+77,8.54394814368364e+96,1.5760802478557792e+116,2.9073548971824276e+135,5.363123171977039e+154,9.893216058924181e+173,1.824976247048878e+193,3.366486976990959e+212,6.210072369202836e+231,1.1455561567389984e+251,2.113178124542661e+270,3.89812560456e+289}'::float8[])[(((((((int8(float8send(k_a)) >> 32)::int) >> 20) & 2047) - 1043) + 1022) >> 6) + 1] * ('{1,2,4,8,16,32,64,128,256,512,1024,2048,4096,8192,16384,32768,65536,131072,262144,524288,1048576,2097152,4194304,8388608,16777216,33554432,67108864,134217728,268435456,536870912,1073741824,2147483648,4294967296,8589934592,17179869184,34359738368,68719476736,137438953472,274877906944,549755813888,1099511627776,2199023255552,4398046511104,8796093022208,17592186044416,35184372088832,70368744177664,140737488355328,281474976710656,562949953421312,1125899906842624,2251799813685248,4503599627370496,9007199254740992,18014398509481984,36028797018963970,72057594037927940,144115188075855870,288230376151711740,576460752303423500,1152921504606847000,2305843009213694000,4611686018427388000,9223372036854776000}'::float8[])[(((((((int8(float8send(k_a)) >> 32)::int) >> 20) & 2047) - 1043) + 1022) & 63) + 1]));
      if abs(k_t) >= 1e-144 and abs(k_t) <= 1e144 and abs(k_z) >= 1e-144 and abs(k_z) <= 1e144 and abs((1)::float8) <= 1e288 then
        f_p := k_t * k_z;
        f_ah := (k_t * 134217729 - (k_t * 134217729 - k_t));
        f_bh := (k_z * 134217729 - (k_z * 134217729 - k_z));
        f_e := (k_t - f_ah) * (k_z - f_bh) - (((f_p - f_ah * f_bh) - (k_t - f_ah) * f_bh) - f_ah * (k_z - f_bh));
        f_s := (1)::float8 + f_p;
        f_tl := ((1)::float8 - (f_s - (f_s - (1)::float8))) + (f_p - (f_s - (1)::float8));
        f_w := (f_tl - ((f_tl + f_e) - ((f_tl + f_e) - f_tl))) + (f_e - ((f_tl + f_e) - f_tl));
        k_s := f_s + (f_tl + f_e);
        if f_w <> 0 and ((f_s - (k_s - (k_s - f_s))) + ((f_tl + f_e) - (k_s - f_s))) <> 0 and (k_s + 2 * ((f_s - (k_s - (k_s - f_s))) + ((f_tl + f_e) - (k_s - f_s)))) - k_s = 2 * ((f_s - (k_s - (k_s - f_s))) + ((f_tl + f_e) - (k_s - f_s))) and (f_w < 0) = (((f_s - (k_s - (k_s - f_s))) + ((f_tl + f_e) - (k_s - f_s))) < 0) then k_s := k_s + 2 * ((f_s - (k_s - (k_s - f_s))) + ((f_tl + f_e) - (k_s - f_s))); end if;
      elsif k_t = 0 or k_z = 0 then
        k_s := k_t * k_z + (1)::float8;
      else
        k_s := fdlibm_fma_wide(a => k_t, b => k_z, c => (1)::float8);
      end if;
      if abs(k_t) >= 1e-144 and abs(k_t) <= 1e144 and abs(k_v) >= 1e-144 and abs(k_v) <= 1e144 and abs(k_s) <= 1e288 then
        f_p := k_t * k_v;
        f_ah := (k_t * 134217729 - (k_t * 134217729 - k_t));
        f_bh := (k_v * 134217729 - (k_v * 134217729 - k_v));
        f_e := (k_t - f_ah) * (k_v - f_bh) - (((f_p - f_ah * f_bh) - (k_t - f_ah) * f_bh) - f_ah * (k_v - f_bh));
        f_s := k_s + f_p;
        f_tl := (k_s - (f_s - (f_s - k_s))) + (f_p - (f_s - k_s));
        f_w := (f_tl - ((f_tl + f_e) - ((f_tl + f_e) - f_tl))) + (f_e - ((f_tl + f_e) - f_tl));
        k_u := f_s + (f_tl + f_e);
        if f_w <> 0 and ((f_s - (k_u - (k_u - f_s))) + ((f_tl + f_e) - (k_u - f_s))) <> 0 and (k_u + 2 * ((f_s - (k_u - (k_u - f_s))) + ((f_tl + f_e) - (k_u - f_s)))) - k_u = 2 * ((f_s - (k_u - (k_u - f_s))) + ((f_tl + f_e) - (k_u - f_s))) and (f_w < 0) = (((f_s - (k_u - (k_u - f_s))) + ((f_tl + f_e) - (k_u - f_s))) < 0) then k_u := k_u + 2 * ((f_s - (k_u - (k_u - f_s))) + ((f_tl + f_e) - (k_u - f_s))); end if;
      elsif k_t = 0 or k_v = 0 then
        k_u := k_t * k_v + k_s;
      else
        k_u := fdlibm_fma_wide(a => k_t, b => k_v, c => k_s);
      end if;
      if abs(k_a) >= 1e-144 and abs(k_a) <= 1e144 and abs(k_u) >= 1e-144 and abs(k_u) <= 1e144 and abs(k_t) <= 1e288 then
        f_p := k_a * k_u;
        f_ah := (k_a * 134217729 - (k_a * 134217729 - k_a));
        f_bh := (k_u * 134217729 - (k_u * 134217729 - k_u));
        f_e := (k_a - f_ah) * (k_u - f_bh) - (((f_p - f_ah * f_bh) - (k_a - f_ah) * f_bh) - f_ah * (k_u - f_bh));
        f_s := k_t + f_p;
        f_tl := (k_t - (f_s - (f_s - k_t))) + (f_p - (f_s - k_t));
        f_w := (f_tl - ((f_tl + f_e) - ((f_tl + f_e) - f_tl))) + (f_e - ((f_tl + f_e) - f_tl));
        res := f_s + (f_tl + f_e);
        if f_w <> 0 and ((f_s - (res - (res - f_s))) + ((f_tl + f_e) - (res - f_s))) <> 0 and (res + 2 * ((f_s - (res - (res - f_s))) + ((f_tl + f_e) - (res - f_s)))) - res = 2 * ((f_s - (res - (res - f_s))) + ((f_tl + f_e) - (res - f_s))) and (f_w < 0) = (((f_s - (res - (res - f_s))) + ((f_tl + f_e) - (res - f_s))) < 0) then res := res + 2 * ((f_s - (res - (res - f_s))) + ((f_tl + f_e) - (res - f_s))); end if;
      elsif k_a = 0 or k_u = 0 then
        res := k_a * k_u + k_t;
      else
        res := fdlibm_fma_wide(a => k_a, b => k_u, c => k_t);
      end if;
    end if;
  else
    if k_ix >= 0x3FE59428 then
      if k_hx < 0 then k_x := -k_x; k_y := -k_y; end if;
      k_z := 7.85398163397448278999e-01 - k_x;
      k_w := 3.06161699786838301793e-17 - k_y;
      k_x := k_z + k_w;
      k_y := 0;
    end if;
    k_z := k_x * k_x;
    k_w := k_z * k_z;
    if abs(k_w) >= 1e-144 and abs(k_w) <= 1e144 and abs((-1.85586374855275456654e-05)::float8) >= 1e-144 and abs((-1.85586374855275456654e-05)::float8) <= 1e144 and abs((7.81794442939557092300e-05)::float8) <= 1e288 then
      f_p := k_w * (-1.85586374855275456654e-05)::float8;
      f_ah := (k_w * 134217729 - (k_w * 134217729 - k_w));
      f_e := (k_w - f_ah) * ((-1.85586374855275456654e-05)::float8 - ((-1.85586374855275456654e-05)::float8 * 134217729 - ((-1.85586374855275456654e-05)::float8 * 134217729 - (-1.85586374855275456654e-05)::float8))) - (((f_p - f_ah * ((-1.85586374855275456654e-05)::float8 * 134217729 - ((-1.85586374855275456654e-05)::float8 * 134217729 - (-1.85586374855275456654e-05)::float8))) - (k_w - f_ah) * ((-1.85586374855275456654e-05)::float8 * 134217729 - ((-1.85586374855275456654e-05)::float8 * 134217729 - (-1.85586374855275456654e-05)::float8))) - f_ah * ((-1.85586374855275456654e-05)::float8 - ((-1.85586374855275456654e-05)::float8 * 134217729 - ((-1.85586374855275456654e-05)::float8 * 134217729 - (-1.85586374855275456654e-05)::float8))));
      f_s := (7.81794442939557092300e-05)::float8 + f_p;
      f_tl := ((7.81794442939557092300e-05)::float8 - (f_s - (f_s - (7.81794442939557092300e-05)::float8))) + (f_p - (f_s - (7.81794442939557092300e-05)::float8));
      f_w := (f_tl - ((f_tl + f_e) - ((f_tl + f_e) - f_tl))) + (f_e - ((f_tl + f_e) - f_tl));
      k_r := f_s + (f_tl + f_e);
      if f_w <> 0 and ((f_s - (k_r - (k_r - f_s))) + ((f_tl + f_e) - (k_r - f_s))) <> 0 and (k_r + 2 * ((f_s - (k_r - (k_r - f_s))) + ((f_tl + f_e) - (k_r - f_s)))) - k_r = 2 * ((f_s - (k_r - (k_r - f_s))) + ((f_tl + f_e) - (k_r - f_s))) and (f_w < 0) = (((f_s - (k_r - (k_r - f_s))) + ((f_tl + f_e) - (k_r - f_s))) < 0) then k_r := k_r + 2 * ((f_s - (k_r - (k_r - f_s))) + ((f_tl + f_e) - (k_r - f_s))); end if;
    elsif k_w = 0 or (-1.85586374855275456654e-05)::float8 = 0 then
      k_r := k_w * (-1.85586374855275456654e-05)::float8 + (7.81794442939557092300e-05)::float8;
    else
      k_r := fdlibm_fma_wide(a => k_w, b => (-1.85586374855275456654e-05)::float8, c => (7.81794442939557092300e-05)::float8);
    end if;
    if abs(k_w) >= 1e-144 and abs(k_w) <= 1e144 and abs(k_r) >= 1e-144 and abs(k_r) <= 1e144 and abs((5.88041240820264096874e-04)::float8) <= 1e288 then
      f_p := k_w * k_r;
      f_ah := (k_w * 134217729 - (k_w * 134217729 - k_w));
      f_bh := (k_r * 134217729 - (k_r * 134217729 - k_r));
      f_e := (k_w - f_ah) * (k_r - f_bh) - (((f_p - f_ah * f_bh) - (k_w - f_ah) * f_bh) - f_ah * (k_r - f_bh));
      f_s := (5.88041240820264096874e-04)::float8 + f_p;
      f_tl := ((5.88041240820264096874e-04)::float8 - (f_s - (f_s - (5.88041240820264096874e-04)::float8))) + (f_p - (f_s - (5.88041240820264096874e-04)::float8));
      f_w := (f_tl - ((f_tl + f_e) - ((f_tl + f_e) - f_tl))) + (f_e - ((f_tl + f_e) - f_tl));
      k_r := f_s + (f_tl + f_e);
      if f_w <> 0 and ((f_s - (k_r - (k_r - f_s))) + ((f_tl + f_e) - (k_r - f_s))) <> 0 and (k_r + 2 * ((f_s - (k_r - (k_r - f_s))) + ((f_tl + f_e) - (k_r - f_s)))) - k_r = 2 * ((f_s - (k_r - (k_r - f_s))) + ((f_tl + f_e) - (k_r - f_s))) and (f_w < 0) = (((f_s - (k_r - (k_r - f_s))) + ((f_tl + f_e) - (k_r - f_s))) < 0) then k_r := k_r + 2 * ((f_s - (k_r - (k_r - f_s))) + ((f_tl + f_e) - (k_r - f_s))); end if;
    elsif k_w = 0 or k_r = 0 then
      k_r := k_w * k_r + (5.88041240820264096874e-04)::float8;
    else
      k_r := fdlibm_fma_wide(a => k_w, b => k_r, c => (5.88041240820264096874e-04)::float8);
    end if;
    if abs(k_w) >= 1e-144 and abs(k_w) <= 1e144 and abs(k_r) >= 1e-144 and abs(k_r) <= 1e144 and abs((3.59207910759131235356e-03)::float8) <= 1e288 then
      f_p := k_w * k_r;
      f_ah := (k_w * 134217729 - (k_w * 134217729 - k_w));
      f_bh := (k_r * 134217729 - (k_r * 134217729 - k_r));
      f_e := (k_w - f_ah) * (k_r - f_bh) - (((f_p - f_ah * f_bh) - (k_w - f_ah) * f_bh) - f_ah * (k_r - f_bh));
      f_s := (3.59207910759131235356e-03)::float8 + f_p;
      f_tl := ((3.59207910759131235356e-03)::float8 - (f_s - (f_s - (3.59207910759131235356e-03)::float8))) + (f_p - (f_s - (3.59207910759131235356e-03)::float8));
      f_w := (f_tl - ((f_tl + f_e) - ((f_tl + f_e) - f_tl))) + (f_e - ((f_tl + f_e) - f_tl));
      k_r := f_s + (f_tl + f_e);
      if f_w <> 0 and ((f_s - (k_r - (k_r - f_s))) + ((f_tl + f_e) - (k_r - f_s))) <> 0 and (k_r + 2 * ((f_s - (k_r - (k_r - f_s))) + ((f_tl + f_e) - (k_r - f_s)))) - k_r = 2 * ((f_s - (k_r - (k_r - f_s))) + ((f_tl + f_e) - (k_r - f_s))) and (f_w < 0) = (((f_s - (k_r - (k_r - f_s))) + ((f_tl + f_e) - (k_r - f_s))) < 0) then k_r := k_r + 2 * ((f_s - (k_r - (k_r - f_s))) + ((f_tl + f_e) - (k_r - f_s))); end if;
    elsif k_w = 0 or k_r = 0 then
      k_r := k_w * k_r + (3.59207910759131235356e-03)::float8;
    else
      k_r := fdlibm_fma_wide(a => k_w, b => k_r, c => (3.59207910759131235356e-03)::float8);
    end if;
    if abs(k_w) >= 1e-144 and abs(k_w) <= 1e144 and abs(k_r) >= 1e-144 and abs(k_r) <= 1e144 and abs((2.18694882948595424599e-02)::float8) <= 1e288 then
      f_p := k_w * k_r;
      f_ah := (k_w * 134217729 - (k_w * 134217729 - k_w));
      f_bh := (k_r * 134217729 - (k_r * 134217729 - k_r));
      f_e := (k_w - f_ah) * (k_r - f_bh) - (((f_p - f_ah * f_bh) - (k_w - f_ah) * f_bh) - f_ah * (k_r - f_bh));
      f_s := (2.18694882948595424599e-02)::float8 + f_p;
      f_tl := ((2.18694882948595424599e-02)::float8 - (f_s - (f_s - (2.18694882948595424599e-02)::float8))) + (f_p - (f_s - (2.18694882948595424599e-02)::float8));
      f_w := (f_tl - ((f_tl + f_e) - ((f_tl + f_e) - f_tl))) + (f_e - ((f_tl + f_e) - f_tl));
      k_r := f_s + (f_tl + f_e);
      if f_w <> 0 and ((f_s - (k_r - (k_r - f_s))) + ((f_tl + f_e) - (k_r - f_s))) <> 0 and (k_r + 2 * ((f_s - (k_r - (k_r - f_s))) + ((f_tl + f_e) - (k_r - f_s)))) - k_r = 2 * ((f_s - (k_r - (k_r - f_s))) + ((f_tl + f_e) - (k_r - f_s))) and (f_w < 0) = (((f_s - (k_r - (k_r - f_s))) + ((f_tl + f_e) - (k_r - f_s))) < 0) then k_r := k_r + 2 * ((f_s - (k_r - (k_r - f_s))) + ((f_tl + f_e) - (k_r - f_s))); end if;
    elsif k_w = 0 or k_r = 0 then
      k_r := k_w * k_r + (2.18694882948595424599e-02)::float8;
    else
      k_r := fdlibm_fma_wide(a => k_w, b => k_r, c => (2.18694882948595424599e-02)::float8);
    end if;
    if abs(k_w) >= 1e-144 and abs(k_w) <= 1e144 and abs(k_r) >= 1e-144 and abs(k_r) <= 1e144 and abs((1.33333333333201242699e-01)::float8) <= 1e288 then
      f_p := k_w * k_r;
      f_ah := (k_w * 134217729 - (k_w * 134217729 - k_w));
      f_bh := (k_r * 134217729 - (k_r * 134217729 - k_r));
      f_e := (k_w - f_ah) * (k_r - f_bh) - (((f_p - f_ah * f_bh) - (k_w - f_ah) * f_bh) - f_ah * (k_r - f_bh));
      f_s := (1.33333333333201242699e-01)::float8 + f_p;
      f_tl := ((1.33333333333201242699e-01)::float8 - (f_s - (f_s - (1.33333333333201242699e-01)::float8))) + (f_p - (f_s - (1.33333333333201242699e-01)::float8));
      f_w := (f_tl - ((f_tl + f_e) - ((f_tl + f_e) - f_tl))) + (f_e - ((f_tl + f_e) - f_tl));
      k_r := f_s + (f_tl + f_e);
      if f_w <> 0 and ((f_s - (k_r - (k_r - f_s))) + ((f_tl + f_e) - (k_r - f_s))) <> 0 and (k_r + 2 * ((f_s - (k_r - (k_r - f_s))) + ((f_tl + f_e) - (k_r - f_s)))) - k_r = 2 * ((f_s - (k_r - (k_r - f_s))) + ((f_tl + f_e) - (k_r - f_s))) and (f_w < 0) = (((f_s - (k_r - (k_r - f_s))) + ((f_tl + f_e) - (k_r - f_s))) < 0) then k_r := k_r + 2 * ((f_s - (k_r - (k_r - f_s))) + ((f_tl + f_e) - (k_r - f_s))); end if;
    elsif k_w = 0 or k_r = 0 then
      k_r := k_w * k_r + (1.33333333333201242699e-01)::float8;
    else
      k_r := fdlibm_fma_wide(a => k_w, b => k_r, c => (1.33333333333201242699e-01)::float8);
    end if;
    if abs(k_w) >= 1e-144 and abs(k_w) <= 1e144 and abs((2.59073051863633712884e-05)::float8) >= 1e-144 and abs((2.59073051863633712884e-05)::float8) <= 1e144 and abs((7.14072491382608190305e-05)::float8) <= 1e288 then
      f_p := k_w * (2.59073051863633712884e-05)::float8;
      f_ah := (k_w * 134217729 - (k_w * 134217729 - k_w));
      f_e := (k_w - f_ah) * ((2.59073051863633712884e-05)::float8 - ((2.59073051863633712884e-05)::float8 * 134217729 - ((2.59073051863633712884e-05)::float8 * 134217729 - (2.59073051863633712884e-05)::float8))) - (((f_p - f_ah * ((2.59073051863633712884e-05)::float8 * 134217729 - ((2.59073051863633712884e-05)::float8 * 134217729 - (2.59073051863633712884e-05)::float8))) - (k_w - f_ah) * ((2.59073051863633712884e-05)::float8 * 134217729 - ((2.59073051863633712884e-05)::float8 * 134217729 - (2.59073051863633712884e-05)::float8))) - f_ah * ((2.59073051863633712884e-05)::float8 - ((2.59073051863633712884e-05)::float8 * 134217729 - ((2.59073051863633712884e-05)::float8 * 134217729 - (2.59073051863633712884e-05)::float8))));
      f_s := (7.14072491382608190305e-05)::float8 + f_p;
      f_tl := ((7.14072491382608190305e-05)::float8 - (f_s - (f_s - (7.14072491382608190305e-05)::float8))) + (f_p - (f_s - (7.14072491382608190305e-05)::float8));
      f_w := (f_tl - ((f_tl + f_e) - ((f_tl + f_e) - f_tl))) + (f_e - ((f_tl + f_e) - f_tl));
      k_v := f_s + (f_tl + f_e);
      if f_w <> 0 and ((f_s - (k_v - (k_v - f_s))) + ((f_tl + f_e) - (k_v - f_s))) <> 0 and (k_v + 2 * ((f_s - (k_v - (k_v - f_s))) + ((f_tl + f_e) - (k_v - f_s)))) - k_v = 2 * ((f_s - (k_v - (k_v - f_s))) + ((f_tl + f_e) - (k_v - f_s))) and (f_w < 0) = (((f_s - (k_v - (k_v - f_s))) + ((f_tl + f_e) - (k_v - f_s))) < 0) then k_v := k_v + 2 * ((f_s - (k_v - (k_v - f_s))) + ((f_tl + f_e) - (k_v - f_s))); end if;
    elsif k_w = 0 or (2.59073051863633712884e-05)::float8 = 0 then
      k_v := k_w * (2.59073051863633712884e-05)::float8 + (7.14072491382608190305e-05)::float8;
    else
      k_v := fdlibm_fma_wide(a => k_w, b => (2.59073051863633712884e-05)::float8, c => (7.14072491382608190305e-05)::float8);
    end if;
    if abs(k_w) >= 1e-144 and abs(k_w) <= 1e144 and abs(k_v) >= 1e-144 and abs(k_v) <= 1e144 and abs((2.46463134818469906812e-04)::float8) <= 1e288 then
      f_p := k_w * k_v;
      f_ah := (k_w * 134217729 - (k_w * 134217729 - k_w));
      f_bh := (k_v * 134217729 - (k_v * 134217729 - k_v));
      f_e := (k_w - f_ah) * (k_v - f_bh) - (((f_p - f_ah * f_bh) - (k_w - f_ah) * f_bh) - f_ah * (k_v - f_bh));
      f_s := (2.46463134818469906812e-04)::float8 + f_p;
      f_tl := ((2.46463134818469906812e-04)::float8 - (f_s - (f_s - (2.46463134818469906812e-04)::float8))) + (f_p - (f_s - (2.46463134818469906812e-04)::float8));
      f_w := (f_tl - ((f_tl + f_e) - ((f_tl + f_e) - f_tl))) + (f_e - ((f_tl + f_e) - f_tl));
      k_v := f_s + (f_tl + f_e);
      if f_w <> 0 and ((f_s - (k_v - (k_v - f_s))) + ((f_tl + f_e) - (k_v - f_s))) <> 0 and (k_v + 2 * ((f_s - (k_v - (k_v - f_s))) + ((f_tl + f_e) - (k_v - f_s)))) - k_v = 2 * ((f_s - (k_v - (k_v - f_s))) + ((f_tl + f_e) - (k_v - f_s))) and (f_w < 0) = (((f_s - (k_v - (k_v - f_s))) + ((f_tl + f_e) - (k_v - f_s))) < 0) then k_v := k_v + 2 * ((f_s - (k_v - (k_v - f_s))) + ((f_tl + f_e) - (k_v - f_s))); end if;
    elsif k_w = 0 or k_v = 0 then
      k_v := k_w * k_v + (2.46463134818469906812e-04)::float8;
    else
      k_v := fdlibm_fma_wide(a => k_w, b => k_v, c => (2.46463134818469906812e-04)::float8);
    end if;
    if abs(k_w) >= 1e-144 and abs(k_w) <= 1e144 and abs(k_v) >= 1e-144 and abs(k_v) <= 1e144 and abs((1.45620945432529025516e-03)::float8) <= 1e288 then
      f_p := k_w * k_v;
      f_ah := (k_w * 134217729 - (k_w * 134217729 - k_w));
      f_bh := (k_v * 134217729 - (k_v * 134217729 - k_v));
      f_e := (k_w - f_ah) * (k_v - f_bh) - (((f_p - f_ah * f_bh) - (k_w - f_ah) * f_bh) - f_ah * (k_v - f_bh));
      f_s := (1.45620945432529025516e-03)::float8 + f_p;
      f_tl := ((1.45620945432529025516e-03)::float8 - (f_s - (f_s - (1.45620945432529025516e-03)::float8))) + (f_p - (f_s - (1.45620945432529025516e-03)::float8));
      f_w := (f_tl - ((f_tl + f_e) - ((f_tl + f_e) - f_tl))) + (f_e - ((f_tl + f_e) - f_tl));
      k_v := f_s + (f_tl + f_e);
      if f_w <> 0 and ((f_s - (k_v - (k_v - f_s))) + ((f_tl + f_e) - (k_v - f_s))) <> 0 and (k_v + 2 * ((f_s - (k_v - (k_v - f_s))) + ((f_tl + f_e) - (k_v - f_s)))) - k_v = 2 * ((f_s - (k_v - (k_v - f_s))) + ((f_tl + f_e) - (k_v - f_s))) and (f_w < 0) = (((f_s - (k_v - (k_v - f_s))) + ((f_tl + f_e) - (k_v - f_s))) < 0) then k_v := k_v + 2 * ((f_s - (k_v - (k_v - f_s))) + ((f_tl + f_e) - (k_v - f_s))); end if;
    elsif k_w = 0 or k_v = 0 then
      k_v := k_w * k_v + (1.45620945432529025516e-03)::float8;
    else
      k_v := fdlibm_fma_wide(a => k_w, b => k_v, c => (1.45620945432529025516e-03)::float8);
    end if;
    if abs(k_w) >= 1e-144 and abs(k_w) <= 1e144 and abs(k_v) >= 1e-144 and abs(k_v) <= 1e144 and abs((8.86323982359930005737e-03)::float8) <= 1e288 then
      f_p := k_w * k_v;
      f_ah := (k_w * 134217729 - (k_w * 134217729 - k_w));
      f_bh := (k_v * 134217729 - (k_v * 134217729 - k_v));
      f_e := (k_w - f_ah) * (k_v - f_bh) - (((f_p - f_ah * f_bh) - (k_w - f_ah) * f_bh) - f_ah * (k_v - f_bh));
      f_s := (8.86323982359930005737e-03)::float8 + f_p;
      f_tl := ((8.86323982359930005737e-03)::float8 - (f_s - (f_s - (8.86323982359930005737e-03)::float8))) + (f_p - (f_s - (8.86323982359930005737e-03)::float8));
      f_w := (f_tl - ((f_tl + f_e) - ((f_tl + f_e) - f_tl))) + (f_e - ((f_tl + f_e) - f_tl));
      k_v := f_s + (f_tl + f_e);
      if f_w <> 0 and ((f_s - (k_v - (k_v - f_s))) + ((f_tl + f_e) - (k_v - f_s))) <> 0 and (k_v + 2 * ((f_s - (k_v - (k_v - f_s))) + ((f_tl + f_e) - (k_v - f_s)))) - k_v = 2 * ((f_s - (k_v - (k_v - f_s))) + ((f_tl + f_e) - (k_v - f_s))) and (f_w < 0) = (((f_s - (k_v - (k_v - f_s))) + ((f_tl + f_e) - (k_v - f_s))) < 0) then k_v := k_v + 2 * ((f_s - (k_v - (k_v - f_s))) + ((f_tl + f_e) - (k_v - f_s))); end if;
    elsif k_w = 0 or k_v = 0 then
      k_v := k_w * k_v + (8.86323982359930005737e-03)::float8;
    else
      k_v := fdlibm_fma_wide(a => k_w, b => k_v, c => (8.86323982359930005737e-03)::float8);
    end if;
    if abs(k_w) >= 1e-144 and abs(k_w) <= 1e144 and abs(k_v) >= 1e-144 and abs(k_v) <= 1e144 and abs((5.39682539762260521377e-02)::float8) <= 1e288 then
      f_p := k_w * k_v;
      f_ah := (k_w * 134217729 - (k_w * 134217729 - k_w));
      f_bh := (k_v * 134217729 - (k_v * 134217729 - k_v));
      f_e := (k_w - f_ah) * (k_v - f_bh) - (((f_p - f_ah * f_bh) - (k_w - f_ah) * f_bh) - f_ah * (k_v - f_bh));
      f_s := (5.39682539762260521377e-02)::float8 + f_p;
      f_tl := ((5.39682539762260521377e-02)::float8 - (f_s - (f_s - (5.39682539762260521377e-02)::float8))) + (f_p - (f_s - (5.39682539762260521377e-02)::float8));
      f_w := (f_tl - ((f_tl + f_e) - ((f_tl + f_e) - f_tl))) + (f_e - ((f_tl + f_e) - f_tl));
      k_v := f_s + (f_tl + f_e);
      if f_w <> 0 and ((f_s - (k_v - (k_v - f_s))) + ((f_tl + f_e) - (k_v - f_s))) <> 0 and (k_v + 2 * ((f_s - (k_v - (k_v - f_s))) + ((f_tl + f_e) - (k_v - f_s)))) - k_v = 2 * ((f_s - (k_v - (k_v - f_s))) + ((f_tl + f_e) - (k_v - f_s))) and (f_w < 0) = (((f_s - (k_v - (k_v - f_s))) + ((f_tl + f_e) - (k_v - f_s))) < 0) then k_v := k_v + 2 * ((f_s - (k_v - (k_v - f_s))) + ((f_tl + f_e) - (k_v - f_s))); end if;
    elsif k_w = 0 or k_v = 0 then
      k_v := k_w * k_v + (5.39682539762260521377e-02)::float8;
    else
      k_v := fdlibm_fma_wide(a => k_w, b => k_v, c => (5.39682539762260521377e-02)::float8);
    end if;
    k_v := k_z * k_v;
    k_s := k_z * k_x;
    f_b := k_r + k_v;
    if abs(k_s) >= 1e-144 and abs(k_s) <= 1e144 and abs(f_b) >= 1e-144 and abs(f_b) <= 1e144 and abs(k_y) <= 1e288 then
      f_p := k_s * f_b;
      f_ah := (k_s * 134217729 - (k_s * 134217729 - k_s));
      f_bh := (f_b * 134217729 - (f_b * 134217729 - f_b));
      f_e := (k_s - f_ah) * (f_b - f_bh) - (((f_p - f_ah * f_bh) - (k_s - f_ah) * f_bh) - f_ah * (f_b - f_bh));
      f_s := k_y + f_p;
      f_tl := (k_y - (f_s - (f_s - k_y))) + (f_p - (f_s - k_y));
      f_w := (f_tl - ((f_tl + f_e) - ((f_tl + f_e) - f_tl))) + (f_e - ((f_tl + f_e) - f_tl));
      k_u := f_s + (f_tl + f_e);
      if f_w <> 0 and ((f_s - (k_u - (k_u - f_s))) + ((f_tl + f_e) - (k_u - f_s))) <> 0 and (k_u + 2 * ((f_s - (k_u - (k_u - f_s))) + ((f_tl + f_e) - (k_u - f_s)))) - k_u = 2 * ((f_s - (k_u - (k_u - f_s))) + ((f_tl + f_e) - (k_u - f_s))) and (f_w < 0) = (((f_s - (k_u - (k_u - f_s))) + ((f_tl + f_e) - (k_u - f_s))) < 0) then k_u := k_u + 2 * ((f_s - (k_u - (k_u - f_s))) + ((f_tl + f_e) - (k_u - f_s))); end if;
    elsif k_s = 0 or f_b = 0 then
      k_u := k_s * f_b + k_y;
    else
      k_u := fdlibm_fma_wide(a => k_s, b => f_b, c => k_y);
    end if;
    if abs(k_z) >= 1e-144 and abs(k_z) <= 1e144 and abs(k_u) >= 1e-144 and abs(k_u) <= 1e144 and abs(k_y) <= 1e288 then
      f_p := k_z * k_u;
      f_ah := (k_z * 134217729 - (k_z * 134217729 - k_z));
      f_bh := (k_u * 134217729 - (k_u * 134217729 - k_u));
      f_e := (k_z - f_ah) * (k_u - f_bh) - (((f_p - f_ah * f_bh) - (k_z - f_ah) * f_bh) - f_ah * (k_u - f_bh));
      f_s := k_y + f_p;
      f_tl := (k_y - (f_s - (f_s - k_y))) + (f_p - (f_s - k_y));
      f_w := (f_tl - ((f_tl + f_e) - ((f_tl + f_e) - f_tl))) + (f_e - ((f_tl + f_e) - f_tl));
      k_r := f_s + (f_tl + f_e);
      if f_w <> 0 and ((f_s - (k_r - (k_r - f_s))) + ((f_tl + f_e) - (k_r - f_s))) <> 0 and (k_r + 2 * ((f_s - (k_r - (k_r - f_s))) + ((f_tl + f_e) - (k_r - f_s)))) - k_r = 2 * ((f_s - (k_r - (k_r - f_s))) + ((f_tl + f_e) - (k_r - f_s))) and (f_w < 0) = (((f_s - (k_r - (k_r - f_s))) + ((f_tl + f_e) - (k_r - f_s))) < 0) then k_r := k_r + 2 * ((f_s - (k_r - (k_r - f_s))) + ((f_tl + f_e) - (k_r - f_s))); end if;
    elsif k_z = 0 or k_u = 0 then
      k_r := k_z * k_u + k_y;
    else
      k_r := fdlibm_fma_wide(a => k_z, b => k_u, c => k_y);
    end if;
    if abs((3.33333333333334091986e-01)::float8) >= 1e-144 and abs((3.33333333333334091986e-01)::float8) <= 1e144 and abs(k_s) >= 1e-144 and abs(k_s) <= 1e144 and abs(k_r) <= 1e288 then
      f_p := (3.33333333333334091986e-01)::float8 * k_s;
      f_bh := (k_s * 134217729 - (k_s * 134217729 - k_s));
      f_e := ((3.33333333333334091986e-01)::float8 - ((3.33333333333334091986e-01)::float8 * 134217729 - ((3.33333333333334091986e-01)::float8 * 134217729 - (3.33333333333334091986e-01)::float8))) * (k_s - f_bh) - (((f_p - ((3.33333333333334091986e-01)::float8 * 134217729 - ((3.33333333333334091986e-01)::float8 * 134217729 - (3.33333333333334091986e-01)::float8)) * f_bh) - ((3.33333333333334091986e-01)::float8 - ((3.33333333333334091986e-01)::float8 * 134217729 - ((3.33333333333334091986e-01)::float8 * 134217729 - (3.33333333333334091986e-01)::float8))) * f_bh) - ((3.33333333333334091986e-01)::float8 * 134217729 - ((3.33333333333334091986e-01)::float8 * 134217729 - (3.33333333333334091986e-01)::float8)) * (k_s - f_bh));
      f_s := k_r + f_p;
      f_tl := (k_r - (f_s - (f_s - k_r))) + (f_p - (f_s - k_r));
      f_w := (f_tl - ((f_tl + f_e) - ((f_tl + f_e) - f_tl))) + (f_e - ((f_tl + f_e) - f_tl));
      k_r := f_s + (f_tl + f_e);
      if f_w <> 0 and ((f_s - (k_r - (k_r - f_s))) + ((f_tl + f_e) - (k_r - f_s))) <> 0 and (k_r + 2 * ((f_s - (k_r - (k_r - f_s))) + ((f_tl + f_e) - (k_r - f_s)))) - k_r = 2 * ((f_s - (k_r - (k_r - f_s))) + ((f_tl + f_e) - (k_r - f_s))) and (f_w < 0) = (((f_s - (k_r - (k_r - f_s))) + ((f_tl + f_e) - (k_r - f_s))) < 0) then k_r := k_r + 2 * ((f_s - (k_r - (k_r - f_s))) + ((f_tl + f_e) - (k_r - f_s))); end if;
    elsif (3.33333333333334091986e-01)::float8 = 0 or k_s = 0 then
      k_r := (3.33333333333334091986e-01)::float8 * k_s + k_r;
    else
      k_r := fdlibm_fma_wide(a => (3.33333333333334091986e-01)::float8, b => k_s, c => k_r);
    end if;
    k_w := k_x + k_r;
    if k_ix >= 0x3FE59428 then
      k_v := kiy;
      res := (1 - ((k_hx >> 30) & 2)) * (k_v - 2 * (k_x - (k_w * k_w / (k_w + k_v) - k_r)));
    elsif kiy = 1 then
      res := k_w;
    else
      k_z := (trunc((k_w) * (('{2.2250738585072014e-308,4.1045368012983762e-289,7.571533991467358e-270,1.3967014978599092e-250,2.5764595078388533e-231,4.7527289157379e-212,8.767237396033612e-193,1.617269844780878e-173,2.983336292480083e-154,5.503284107318959e-135,1.0151767349262597e-115,1.8726705418768793e-96,3.454467422037778e-77,6.372367644529809e-58,1.1754943508222875e-38,2.168404344971009e-19,4,73786976294838210000,1.361129467683754e+39,2.5108406941546723e+58,4.631683569492648e+77,8.54394814368364e+96,1.5760802478557792e+116,2.9073548971824276e+135,5.363123171977039e+154,9.893216058924181e+173,1.824976247048878e+193,3.366486976990959e+212,6.210072369202836e+231,1.1455561567389984e+251,2.113178124542661e+270,3.89812560456e+289}'::float8[])[(((1043 - ((((int8(float8send(k_w)) >> 32)::int) >> 20) & 2047)) + 1022) >> 6) + 1] * ('{1,2,4,8,16,32,64,128,256,512,1024,2048,4096,8192,16384,32768,65536,131072,262144,524288,1048576,2097152,4194304,8388608,16777216,33554432,67108864,134217728,268435456,536870912,1073741824,2147483648,4294967296,8589934592,17179869184,34359738368,68719476736,137438953472,274877906944,549755813888,1099511627776,2199023255552,4398046511104,8796093022208,17592186044416,35184372088832,70368744177664,140737488355328,281474976710656,562949953421312,1125899906842624,2251799813685248,4503599627370496,9007199254740992,18014398509481984,36028797018963970,72057594037927940,144115188075855870,288230376151711740,576460752303423500,1152921504606847000,2305843009213694000,4611686018427388000,9223372036854776000}'::float8[])[(((1043 - ((((int8(float8send(k_w)) >> 32)::int) >> 20) & 2047)) + 1022) & 63) + 1])) * (('{2.2250738585072014e-308,4.1045368012983762e-289,7.571533991467358e-270,1.3967014978599092e-250,2.5764595078388533e-231,4.7527289157379e-212,8.767237396033612e-193,1.617269844780878e-173,2.983336292480083e-154,5.503284107318959e-135,1.0151767349262597e-115,1.8726705418768793e-96,3.454467422037778e-77,6.372367644529809e-58,1.1754943508222875e-38,2.168404344971009e-19,4,73786976294838210000,1.361129467683754e+39,2.5108406941546723e+58,4.631683569492648e+77,8.54394814368364e+96,1.5760802478557792e+116,2.9073548971824276e+135,5.363123171977039e+154,9.893216058924181e+173,1.824976247048878e+193,3.366486976990959e+212,6.210072369202836e+231,1.1455561567389984e+251,2.113178124542661e+270,3.89812560456e+289}'::float8[])[(((((((int8(float8send(k_w)) >> 32)::int) >> 20) & 2047) - 1043) + 1022) >> 6) + 1] * ('{1,2,4,8,16,32,64,128,256,512,1024,2048,4096,8192,16384,32768,65536,131072,262144,524288,1048576,2097152,4194304,8388608,16777216,33554432,67108864,134217728,268435456,536870912,1073741824,2147483648,4294967296,8589934592,17179869184,34359738368,68719476736,137438953472,274877906944,549755813888,1099511627776,2199023255552,4398046511104,8796093022208,17592186044416,35184372088832,70368744177664,140737488355328,281474976710656,562949953421312,1125899906842624,2251799813685248,4503599627370496,9007199254740992,18014398509481984,36028797018963970,72057594037927940,144115188075855870,288230376151711740,576460752303423500,1152921504606847000,2305843009213694000,4611686018427388000,9223372036854776000}'::float8[])[(((((((int8(float8send(k_w)) >> 32)::int) >> 20) & 2047) - 1043) + 1022) & 63) + 1]));
      k_v := k_r - (k_z - k_x);
      k_a := -1 / k_w;
      k_t := (trunc((k_a) * (('{2.2250738585072014e-308,4.1045368012983762e-289,7.571533991467358e-270,1.3967014978599092e-250,2.5764595078388533e-231,4.7527289157379e-212,8.767237396033612e-193,1.617269844780878e-173,2.983336292480083e-154,5.503284107318959e-135,1.0151767349262597e-115,1.8726705418768793e-96,3.454467422037778e-77,6.372367644529809e-58,1.1754943508222875e-38,2.168404344971009e-19,4,73786976294838210000,1.361129467683754e+39,2.5108406941546723e+58,4.631683569492648e+77,8.54394814368364e+96,1.5760802478557792e+116,2.9073548971824276e+135,5.363123171977039e+154,9.893216058924181e+173,1.824976247048878e+193,3.366486976990959e+212,6.210072369202836e+231,1.1455561567389984e+251,2.113178124542661e+270,3.89812560456e+289}'::float8[])[(((1043 - ((((int8(float8send(k_a)) >> 32)::int) >> 20) & 2047)) + 1022) >> 6) + 1] * ('{1,2,4,8,16,32,64,128,256,512,1024,2048,4096,8192,16384,32768,65536,131072,262144,524288,1048576,2097152,4194304,8388608,16777216,33554432,67108864,134217728,268435456,536870912,1073741824,2147483648,4294967296,8589934592,17179869184,34359738368,68719476736,137438953472,274877906944,549755813888,1099511627776,2199023255552,4398046511104,8796093022208,17592186044416,35184372088832,70368744177664,140737488355328,281474976710656,562949953421312,1125899906842624,2251799813685248,4503599627370496,9007199254740992,18014398509481984,36028797018963970,72057594037927940,144115188075855870,288230376151711740,576460752303423500,1152921504606847000,2305843009213694000,4611686018427388000,9223372036854776000}'::float8[])[(((1043 - ((((int8(float8send(k_a)) >> 32)::int) >> 20) & 2047)) + 1022) & 63) + 1])) * (('{2.2250738585072014e-308,4.1045368012983762e-289,7.571533991467358e-270,1.3967014978599092e-250,2.5764595078388533e-231,4.7527289157379e-212,8.767237396033612e-193,1.617269844780878e-173,2.983336292480083e-154,5.503284107318959e-135,1.0151767349262597e-115,1.8726705418768793e-96,3.454467422037778e-77,6.372367644529809e-58,1.1754943508222875e-38,2.168404344971009e-19,4,73786976294838210000,1.361129467683754e+39,2.5108406941546723e+58,4.631683569492648e+77,8.54394814368364e+96,1.5760802478557792e+116,2.9073548971824276e+135,5.363123171977039e+154,9.893216058924181e+173,1.824976247048878e+193,3.366486976990959e+212,6.210072369202836e+231,1.1455561567389984e+251,2.113178124542661e+270,3.89812560456e+289}'::float8[])[(((((((int8(float8send(k_a)) >> 32)::int) >> 20) & 2047) - 1043) + 1022) >> 6) + 1] * ('{1,2,4,8,16,32,64,128,256,512,1024,2048,4096,8192,16384,32768,65536,131072,262144,524288,1048576,2097152,4194304,8388608,16777216,33554432,67108864,134217728,268435456,536870912,1073741824,2147483648,4294967296,8589934592,17179869184,34359738368,68719476736,137438953472,274877906944,549755813888,1099511627776,2199023255552,4398046511104,8796093022208,17592186044416,35184372088832,70368744177664,140737488355328,281474976710656,562949953421312,1125899906842624,2251799813685248,4503599627370496,9007199254740992,18014398509481984,36028797018963970,72057594037927940,144115188075855870,288230376151711740,576460752303423500,1152921504606847000,2305843009213694000,4611686018427388000,9223372036854776000}'::float8[])[(((((((int8(float8send(k_a)) >> 32)::int) >> 20) & 2047) - 1043) + 1022) & 63) + 1]));
      if abs(k_t) >= 1e-144 and abs(k_t) <= 1e144 and abs(k_z) >= 1e-144 and abs(k_z) <= 1e144 and abs((1)::float8) <= 1e288 then
        f_p := k_t * k_z;
        f_ah := (k_t * 134217729 - (k_t * 134217729 - k_t));
        f_bh := (k_z * 134217729 - (k_z * 134217729 - k_z));
        f_e := (k_t - f_ah) * (k_z - f_bh) - (((f_p - f_ah * f_bh) - (k_t - f_ah) * f_bh) - f_ah * (k_z - f_bh));
        f_s := (1)::float8 + f_p;
        f_tl := ((1)::float8 - (f_s - (f_s - (1)::float8))) + (f_p - (f_s - (1)::float8));
        f_w := (f_tl - ((f_tl + f_e) - ((f_tl + f_e) - f_tl))) + (f_e - ((f_tl + f_e) - f_tl));
        k_s := f_s + (f_tl + f_e);
        if f_w <> 0 and ((f_s - (k_s - (k_s - f_s))) + ((f_tl + f_e) - (k_s - f_s))) <> 0 and (k_s + 2 * ((f_s - (k_s - (k_s - f_s))) + ((f_tl + f_e) - (k_s - f_s)))) - k_s = 2 * ((f_s - (k_s - (k_s - f_s))) + ((f_tl + f_e) - (k_s - f_s))) and (f_w < 0) = (((f_s - (k_s - (k_s - f_s))) + ((f_tl + f_e) - (k_s - f_s))) < 0) then k_s := k_s + 2 * ((f_s - (k_s - (k_s - f_s))) + ((f_tl + f_e) - (k_s - f_s))); end if;
      elsif k_t = 0 or k_z = 0 then
        k_s := k_t * k_z + (1)::float8;
      else
        k_s := fdlibm_fma_wide(a => k_t, b => k_z, c => (1)::float8);
      end if;
      if abs(k_t) >= 1e-144 and abs(k_t) <= 1e144 and abs(k_v) >= 1e-144 and abs(k_v) <= 1e144 and abs(k_s) <= 1e288 then
        f_p := k_t * k_v;
        f_ah := (k_t * 134217729 - (k_t * 134217729 - k_t));
        f_bh := (k_v * 134217729 - (k_v * 134217729 - k_v));
        f_e := (k_t - f_ah) * (k_v - f_bh) - (((f_p - f_ah * f_bh) - (k_t - f_ah) * f_bh) - f_ah * (k_v - f_bh));
        f_s := k_s + f_p;
        f_tl := (k_s - (f_s - (f_s - k_s))) + (f_p - (f_s - k_s));
        f_w := (f_tl - ((f_tl + f_e) - ((f_tl + f_e) - f_tl))) + (f_e - ((f_tl + f_e) - f_tl));
        k_u := f_s + (f_tl + f_e);
        if f_w <> 0 and ((f_s - (k_u - (k_u - f_s))) + ((f_tl + f_e) - (k_u - f_s))) <> 0 and (k_u + 2 * ((f_s - (k_u - (k_u - f_s))) + ((f_tl + f_e) - (k_u - f_s)))) - k_u = 2 * ((f_s - (k_u - (k_u - f_s))) + ((f_tl + f_e) - (k_u - f_s))) and (f_w < 0) = (((f_s - (k_u - (k_u - f_s))) + ((f_tl + f_e) - (k_u - f_s))) < 0) then k_u := k_u + 2 * ((f_s - (k_u - (k_u - f_s))) + ((f_tl + f_e) - (k_u - f_s))); end if;
      elsif k_t = 0 or k_v = 0 then
        k_u := k_t * k_v + k_s;
      else
        k_u := fdlibm_fma_wide(a => k_t, b => k_v, c => k_s);
      end if;
      if abs(k_a) >= 1e-144 and abs(k_a) <= 1e144 and abs(k_u) >= 1e-144 and abs(k_u) <= 1e144 and abs(k_t) <= 1e288 then
        f_p := k_a * k_u;
        f_ah := (k_a * 134217729 - (k_a * 134217729 - k_a));
        f_bh := (k_u * 134217729 - (k_u * 134217729 - k_u));
        f_e := (k_a - f_ah) * (k_u - f_bh) - (((f_p - f_ah * f_bh) - (k_a - f_ah) * f_bh) - f_ah * (k_u - f_bh));
        f_s := k_t + f_p;
        f_tl := (k_t - (f_s - (f_s - k_t))) + (f_p - (f_s - k_t));
        f_w := (f_tl - ((f_tl + f_e) - ((f_tl + f_e) - f_tl))) + (f_e - ((f_tl + f_e) - f_tl));
        res := f_s + (f_tl + f_e);
        if f_w <> 0 and ((f_s - (res - (res - f_s))) + ((f_tl + f_e) - (res - f_s))) <> 0 and (res + 2 * ((f_s - (res - (res - f_s))) + ((f_tl + f_e) - (res - f_s)))) - res = 2 * ((f_s - (res - (res - f_s))) + ((f_tl + f_e) - (res - f_s))) and (f_w < 0) = (((f_s - (res - (res - f_s))) + ((f_tl + f_e) - (res - f_s))) < 0) then res := res + 2 * ((f_s - (res - (res - f_s))) + ((f_tl + f_e) - (res - f_s))); end if;
      elsif k_a = 0 or k_u = 0 then
        res := k_a * k_u + k_t;
      else
        res := fdlibm_fma_wide(a => k_a, b => k_u, c => k_t);
      end if;
    end if;
  end if;

    return res;
  end if;
  if (n & 1) = (case when 2 = 0 then 0 else 1 end) then
  k_ix := (int8(float8send(y0)) >> 32)::int & 2147483647;
  if k_ix < 0x3E400000 then
    res := y0;
  else
    k_z := y0 * y0;
    k_v := k_z * y0;
    if abs(k_z) >= 1e-144 and abs(k_z) <= 1e144 and abs((1.58969099521155010221e-10)::float8) >= 1e-144 and abs((1.58969099521155010221e-10)::float8) <= 1e144 and abs((-2.50507602534068634195e-08)::float8) <= 1e288 then
      f_p := k_z * (1.58969099521155010221e-10)::float8;
      f_ah := (k_z * 134217729 - (k_z * 134217729 - k_z));
      f_e := (k_z - f_ah) * ((1.58969099521155010221e-10)::float8 - ((1.58969099521155010221e-10)::float8 * 134217729 - ((1.58969099521155010221e-10)::float8 * 134217729 - (1.58969099521155010221e-10)::float8))) - (((f_p - f_ah * ((1.58969099521155010221e-10)::float8 * 134217729 - ((1.58969099521155010221e-10)::float8 * 134217729 - (1.58969099521155010221e-10)::float8))) - (k_z - f_ah) * ((1.58969099521155010221e-10)::float8 * 134217729 - ((1.58969099521155010221e-10)::float8 * 134217729 - (1.58969099521155010221e-10)::float8))) - f_ah * ((1.58969099521155010221e-10)::float8 - ((1.58969099521155010221e-10)::float8 * 134217729 - ((1.58969099521155010221e-10)::float8 * 134217729 - (1.58969099521155010221e-10)::float8))));
      f_s := (-2.50507602534068634195e-08)::float8 + f_p;
      f_tl := ((-2.50507602534068634195e-08)::float8 - (f_s - (f_s - (-2.50507602534068634195e-08)::float8))) + (f_p - (f_s - (-2.50507602534068634195e-08)::float8));
      f_w := (f_tl - ((f_tl + f_e) - ((f_tl + f_e) - f_tl))) + (f_e - ((f_tl + f_e) - f_tl));
      k_r := f_s + (f_tl + f_e);
      if f_w <> 0 and ((f_s - (k_r - (k_r - f_s))) + ((f_tl + f_e) - (k_r - f_s))) <> 0 and (k_r + 2 * ((f_s - (k_r - (k_r - f_s))) + ((f_tl + f_e) - (k_r - f_s)))) - k_r = 2 * ((f_s - (k_r - (k_r - f_s))) + ((f_tl + f_e) - (k_r - f_s))) and (f_w < 0) = (((f_s - (k_r - (k_r - f_s))) + ((f_tl + f_e) - (k_r - f_s))) < 0) then k_r := k_r + 2 * ((f_s - (k_r - (k_r - f_s))) + ((f_tl + f_e) - (k_r - f_s))); end if;
    elsif k_z = 0 or (1.58969099521155010221e-10)::float8 = 0 then
      k_r := k_z * (1.58969099521155010221e-10)::float8 + (-2.50507602534068634195e-08)::float8;
    else
      k_r := fdlibm_fma_wide(a => k_z, b => (1.58969099521155010221e-10)::float8, c => (-2.50507602534068634195e-08)::float8);
    end if;
    if abs(k_z) >= 1e-144 and abs(k_z) <= 1e144 and abs(k_r) >= 1e-144 and abs(k_r) <= 1e144 and abs((2.75573137070700676789e-06)::float8) <= 1e288 then
      f_p := k_z * k_r;
      f_ah := (k_z * 134217729 - (k_z * 134217729 - k_z));
      f_bh := (k_r * 134217729 - (k_r * 134217729 - k_r));
      f_e := (k_z - f_ah) * (k_r - f_bh) - (((f_p - f_ah * f_bh) - (k_z - f_ah) * f_bh) - f_ah * (k_r - f_bh));
      f_s := (2.75573137070700676789e-06)::float8 + f_p;
      f_tl := ((2.75573137070700676789e-06)::float8 - (f_s - (f_s - (2.75573137070700676789e-06)::float8))) + (f_p - (f_s - (2.75573137070700676789e-06)::float8));
      f_w := (f_tl - ((f_tl + f_e) - ((f_tl + f_e) - f_tl))) + (f_e - ((f_tl + f_e) - f_tl));
      k_r := f_s + (f_tl + f_e);
      if f_w <> 0 and ((f_s - (k_r - (k_r - f_s))) + ((f_tl + f_e) - (k_r - f_s))) <> 0 and (k_r + 2 * ((f_s - (k_r - (k_r - f_s))) + ((f_tl + f_e) - (k_r - f_s)))) - k_r = 2 * ((f_s - (k_r - (k_r - f_s))) + ((f_tl + f_e) - (k_r - f_s))) and (f_w < 0) = (((f_s - (k_r - (k_r - f_s))) + ((f_tl + f_e) - (k_r - f_s))) < 0) then k_r := k_r + 2 * ((f_s - (k_r - (k_r - f_s))) + ((f_tl + f_e) - (k_r - f_s))); end if;
    elsif k_z = 0 or k_r = 0 then
      k_r := k_z * k_r + (2.75573137070700676789e-06)::float8;
    else
      k_r := fdlibm_fma_wide(a => k_z, b => k_r, c => (2.75573137070700676789e-06)::float8);
    end if;
    if abs(k_z) >= 1e-144 and abs(k_z) <= 1e144 and abs(k_r) >= 1e-144 and abs(k_r) <= 1e144 and abs((-1.98412698298579493134e-04)::float8) <= 1e288 then
      f_p := k_z * k_r;
      f_ah := (k_z * 134217729 - (k_z * 134217729 - k_z));
      f_bh := (k_r * 134217729 - (k_r * 134217729 - k_r));
      f_e := (k_z - f_ah) * (k_r - f_bh) - (((f_p - f_ah * f_bh) - (k_z - f_ah) * f_bh) - f_ah * (k_r - f_bh));
      f_s := (-1.98412698298579493134e-04)::float8 + f_p;
      f_tl := ((-1.98412698298579493134e-04)::float8 - (f_s - (f_s - (-1.98412698298579493134e-04)::float8))) + (f_p - (f_s - (-1.98412698298579493134e-04)::float8));
      f_w := (f_tl - ((f_tl + f_e) - ((f_tl + f_e) - f_tl))) + (f_e - ((f_tl + f_e) - f_tl));
      k_r := f_s + (f_tl + f_e);
      if f_w <> 0 and ((f_s - (k_r - (k_r - f_s))) + ((f_tl + f_e) - (k_r - f_s))) <> 0 and (k_r + 2 * ((f_s - (k_r - (k_r - f_s))) + ((f_tl + f_e) - (k_r - f_s)))) - k_r = 2 * ((f_s - (k_r - (k_r - f_s))) + ((f_tl + f_e) - (k_r - f_s))) and (f_w < 0) = (((f_s - (k_r - (k_r - f_s))) + ((f_tl + f_e) - (k_r - f_s))) < 0) then k_r := k_r + 2 * ((f_s - (k_r - (k_r - f_s))) + ((f_tl + f_e) - (k_r - f_s))); end if;
    elsif k_z = 0 or k_r = 0 then
      k_r := k_z * k_r + (-1.98412698298579493134e-04)::float8;
    else
      k_r := fdlibm_fma_wide(a => k_z, b => k_r, c => (-1.98412698298579493134e-04)::float8);
    end if;
    if abs(k_z) >= 1e-144 and abs(k_z) <= 1e144 and abs(k_r) >= 1e-144 and abs(k_r) <= 1e144 and abs((8.33333333332248946124e-03)::float8) <= 1e288 then
      f_p := k_z * k_r;
      f_ah := (k_z * 134217729 - (k_z * 134217729 - k_z));
      f_bh := (k_r * 134217729 - (k_r * 134217729 - k_r));
      f_e := (k_z - f_ah) * (k_r - f_bh) - (((f_p - f_ah * f_bh) - (k_z - f_ah) * f_bh) - f_ah * (k_r - f_bh));
      f_s := (8.33333333332248946124e-03)::float8 + f_p;
      f_tl := ((8.33333333332248946124e-03)::float8 - (f_s - (f_s - (8.33333333332248946124e-03)::float8))) + (f_p - (f_s - (8.33333333332248946124e-03)::float8));
      f_w := (f_tl - ((f_tl + f_e) - ((f_tl + f_e) - f_tl))) + (f_e - ((f_tl + f_e) - f_tl));
      k_r := f_s + (f_tl + f_e);
      if f_w <> 0 and ((f_s - (k_r - (k_r - f_s))) + ((f_tl + f_e) - (k_r - f_s))) <> 0 and (k_r + 2 * ((f_s - (k_r - (k_r - f_s))) + ((f_tl + f_e) - (k_r - f_s)))) - k_r = 2 * ((f_s - (k_r - (k_r - f_s))) + ((f_tl + f_e) - (k_r - f_s))) and (f_w < 0) = (((f_s - (k_r - (k_r - f_s))) + ((f_tl + f_e) - (k_r - f_s))) < 0) then k_r := k_r + 2 * ((f_s - (k_r - (k_r - f_s))) + ((f_tl + f_e) - (k_r - f_s))); end if;
    elsif k_z = 0 or k_r = 0 then
      k_r := k_z * k_r + (8.33333333332248946124e-03)::float8;
    else
      k_r := fdlibm_fma_wide(a => k_z, b => k_r, c => (8.33333333332248946124e-03)::float8);
    end if;
    if kiy = 0 then
      if abs(k_z) >= 1e-144 and abs(k_z) <= 1e144 and abs(k_r) >= 1e-144 and abs(k_r) <= 1e144 and abs((-1.66666666666666324348e-01)::float8) <= 1e288 then
        f_p := k_z * k_r;
        f_ah := (k_z * 134217729 - (k_z * 134217729 - k_z));
        f_bh := (k_r * 134217729 - (k_r * 134217729 - k_r));
        f_e := (k_z - f_ah) * (k_r - f_bh) - (((f_p - f_ah * f_bh) - (k_z - f_ah) * f_bh) - f_ah * (k_r - f_bh));
        f_s := (-1.66666666666666324348e-01)::float8 + f_p;
        f_tl := ((-1.66666666666666324348e-01)::float8 - (f_s - (f_s - (-1.66666666666666324348e-01)::float8))) + (f_p - (f_s - (-1.66666666666666324348e-01)::float8));
        f_w := (f_tl - ((f_tl + f_e) - ((f_tl + f_e) - f_tl))) + (f_e - ((f_tl + f_e) - f_tl));
        k_u := f_s + (f_tl + f_e);
        if f_w <> 0 and ((f_s - (k_u - (k_u - f_s))) + ((f_tl + f_e) - (k_u - f_s))) <> 0 and (k_u + 2 * ((f_s - (k_u - (k_u - f_s))) + ((f_tl + f_e) - (k_u - f_s)))) - k_u = 2 * ((f_s - (k_u - (k_u - f_s))) + ((f_tl + f_e) - (k_u - f_s))) and (f_w < 0) = (((f_s - (k_u - (k_u - f_s))) + ((f_tl + f_e) - (k_u - f_s))) < 0) then k_u := k_u + 2 * ((f_s - (k_u - (k_u - f_s))) + ((f_tl + f_e) - (k_u - f_s))); end if;
      elsif k_z = 0 or k_r = 0 then
        k_u := k_z * k_r + (-1.66666666666666324348e-01)::float8;
      else
        k_u := fdlibm_fma_wide(a => k_z, b => k_r, c => (-1.66666666666666324348e-01)::float8);
      end if;
      if abs(k_v) >= 1e-144 and abs(k_v) <= 1e144 and abs(k_u) >= 1e-144 and abs(k_u) <= 1e144 and abs(y0) <= 1e288 then
        f_p := k_v * k_u;
        f_ah := (k_v * 134217729 - (k_v * 134217729 - k_v));
        f_bh := (k_u * 134217729 - (k_u * 134217729 - k_u));
        f_e := (k_v - f_ah) * (k_u - f_bh) - (((f_p - f_ah * f_bh) - (k_v - f_ah) * f_bh) - f_ah * (k_u - f_bh));
        f_s := y0 + f_p;
        f_tl := (y0 - (f_s - (f_s - y0))) + (f_p - (f_s - y0));
        f_w := (f_tl - ((f_tl + f_e) - ((f_tl + f_e) - f_tl))) + (f_e - ((f_tl + f_e) - f_tl));
        res := f_s + (f_tl + f_e);
        if f_w <> 0 and ((f_s - (res - (res - f_s))) + ((f_tl + f_e) - (res - f_s))) <> 0 and (res + 2 * ((f_s - (res - (res - f_s))) + ((f_tl + f_e) - (res - f_s)))) - res = 2 * ((f_s - (res - (res - f_s))) + ((f_tl + f_e) - (res - f_s))) and (f_w < 0) = (((f_s - (res - (res - f_s))) + ((f_tl + f_e) - (res - f_s))) < 0) then res := res + 2 * ((f_s - (res - (res - f_s))) + ((f_tl + f_e) - (res - f_s))); end if;
      elsif k_v = 0 or k_u = 0 then
        res := k_v * k_u + y0;
      else
        res := fdlibm_fma_wide(a => k_v, b => k_u, c => y0);
      end if;
    else
      if abs(k_z) >= 1e-144 and abs(k_z) <= 1e144 and abs((0.5 * y1 - k_v * k_r)::float8) >= 1e-144 and abs((0.5 * y1 - k_v * k_r)::float8) <= 1e144 and abs(-y1) <= 1e288 then
        f_p := k_z * (0.5 * y1 - k_v * k_r)::float8;
        f_ah := (k_z * 134217729 - (k_z * 134217729 - k_z));
        f_e := (k_z - f_ah) * ((0.5 * y1 - k_v * k_r)::float8 - ((0.5 * y1 - k_v * k_r)::float8 * 134217729 - ((0.5 * y1 - k_v * k_r)::float8 * 134217729 - (0.5 * y1 - k_v * k_r)::float8))) - (((f_p - f_ah * ((0.5 * y1 - k_v * k_r)::float8 * 134217729 - ((0.5 * y1 - k_v * k_r)::float8 * 134217729 - (0.5 * y1 - k_v * k_r)::float8))) - (k_z - f_ah) * ((0.5 * y1 - k_v * k_r)::float8 * 134217729 - ((0.5 * y1 - k_v * k_r)::float8 * 134217729 - (0.5 * y1 - k_v * k_r)::float8))) - f_ah * ((0.5 * y1 - k_v * k_r)::float8 - ((0.5 * y1 - k_v * k_r)::float8 * 134217729 - ((0.5 * y1 - k_v * k_r)::float8 * 134217729 - (0.5 * y1 - k_v * k_r)::float8))));
        f_s := -y1 + f_p;
        f_tl := (-y1 - (f_s - (f_s - -y1))) + (f_p - (f_s - -y1));
        f_w := (f_tl - ((f_tl + f_e) - ((f_tl + f_e) - f_tl))) + (f_e - ((f_tl + f_e) - f_tl));
        k_u := f_s + (f_tl + f_e);
        if f_w <> 0 and ((f_s - (k_u - (k_u - f_s))) + ((f_tl + f_e) - (k_u - f_s))) <> 0 and (k_u + 2 * ((f_s - (k_u - (k_u - f_s))) + ((f_tl + f_e) - (k_u - f_s)))) - k_u = 2 * ((f_s - (k_u - (k_u - f_s))) + ((f_tl + f_e) - (k_u - f_s))) and (f_w < 0) = (((f_s - (k_u - (k_u - f_s))) + ((f_tl + f_e) - (k_u - f_s))) < 0) then k_u := k_u + 2 * ((f_s - (k_u - (k_u - f_s))) + ((f_tl + f_e) - (k_u - f_s))); end if;
      elsif k_z = 0 or (0.5 * y1 - k_v * k_r)::float8 = 0 then
        k_u := k_z * (0.5 * y1 - k_v * k_r)::float8 + -y1;
      else
        k_u := fdlibm_fma_wide(a => k_z, b => (0.5 * y1 - k_v * k_r)::float8, c => -y1);
      end if;
      if abs(-k_v) >= 1e-144 and abs(-k_v) <= 1e144 and abs((-1.66666666666666324348e-01)::float8) >= 1e-144 and abs((-1.66666666666666324348e-01)::float8) <= 1e144 and abs(k_u) <= 1e288 then
        f_p := -k_v * (-1.66666666666666324348e-01)::float8;
        f_ah := (-k_v * 134217729 - (-k_v * 134217729 - -k_v));
        f_e := (-k_v - f_ah) * ((-1.66666666666666324348e-01)::float8 - ((-1.66666666666666324348e-01)::float8 * 134217729 - ((-1.66666666666666324348e-01)::float8 * 134217729 - (-1.66666666666666324348e-01)::float8))) - (((f_p - f_ah * ((-1.66666666666666324348e-01)::float8 * 134217729 - ((-1.66666666666666324348e-01)::float8 * 134217729 - (-1.66666666666666324348e-01)::float8))) - (-k_v - f_ah) * ((-1.66666666666666324348e-01)::float8 * 134217729 - ((-1.66666666666666324348e-01)::float8 * 134217729 - (-1.66666666666666324348e-01)::float8))) - f_ah * ((-1.66666666666666324348e-01)::float8 - ((-1.66666666666666324348e-01)::float8 * 134217729 - ((-1.66666666666666324348e-01)::float8 * 134217729 - (-1.66666666666666324348e-01)::float8))));
        f_s := k_u + f_p;
        f_tl := (k_u - (f_s - (f_s - k_u))) + (f_p - (f_s - k_u));
        f_w := (f_tl - ((f_tl + f_e) - ((f_tl + f_e) - f_tl))) + (f_e - ((f_tl + f_e) - f_tl));
        k_u := f_s + (f_tl + f_e);
        if f_w <> 0 and ((f_s - (k_u - (k_u - f_s))) + ((f_tl + f_e) - (k_u - f_s))) <> 0 and (k_u + 2 * ((f_s - (k_u - (k_u - f_s))) + ((f_tl + f_e) - (k_u - f_s)))) - k_u = 2 * ((f_s - (k_u - (k_u - f_s))) + ((f_tl + f_e) - (k_u - f_s))) and (f_w < 0) = (((f_s - (k_u - (k_u - f_s))) + ((f_tl + f_e) - (k_u - f_s))) < 0) then k_u := k_u + 2 * ((f_s - (k_u - (k_u - f_s))) + ((f_tl + f_e) - (k_u - f_s))); end if;
      elsif -k_v = 0 or (-1.66666666666666324348e-01)::float8 = 0 then
        k_u := -k_v * (-1.66666666666666324348e-01)::float8 + k_u;
      else
        k_u := fdlibm_fma_wide(a => -k_v, b => (-1.66666666666666324348e-01)::float8, c => k_u);
      end if;
      res := y0 - k_u;
    end if;
  end if;

  else
  k_ix := (int8(float8send(y0)) >> 32)::int & 2147483647;
  if k_ix < 0x3E400000 then
    res := 1;
  else
    k_z := y0 * y0;
    if abs(k_z) >= 1e-144 and abs(k_z) <= 1e144 and abs((-1.13596475577881948265e-11)::float8) >= 1e-144 and abs((-1.13596475577881948265e-11)::float8) <= 1e144 and abs((2.08757232129817482790e-09)::float8) <= 1e288 then
      f_p := k_z * (-1.13596475577881948265e-11)::float8;
      f_ah := (k_z * 134217729 - (k_z * 134217729 - k_z));
      f_e := (k_z - f_ah) * ((-1.13596475577881948265e-11)::float8 - ((-1.13596475577881948265e-11)::float8 * 134217729 - ((-1.13596475577881948265e-11)::float8 * 134217729 - (-1.13596475577881948265e-11)::float8))) - (((f_p - f_ah * ((-1.13596475577881948265e-11)::float8 * 134217729 - ((-1.13596475577881948265e-11)::float8 * 134217729 - (-1.13596475577881948265e-11)::float8))) - (k_z - f_ah) * ((-1.13596475577881948265e-11)::float8 * 134217729 - ((-1.13596475577881948265e-11)::float8 * 134217729 - (-1.13596475577881948265e-11)::float8))) - f_ah * ((-1.13596475577881948265e-11)::float8 - ((-1.13596475577881948265e-11)::float8 * 134217729 - ((-1.13596475577881948265e-11)::float8 * 134217729 - (-1.13596475577881948265e-11)::float8))));
      f_s := (2.08757232129817482790e-09)::float8 + f_p;
      f_tl := ((2.08757232129817482790e-09)::float8 - (f_s - (f_s - (2.08757232129817482790e-09)::float8))) + (f_p - (f_s - (2.08757232129817482790e-09)::float8));
      f_w := (f_tl - ((f_tl + f_e) - ((f_tl + f_e) - f_tl))) + (f_e - ((f_tl + f_e) - f_tl));
      k_r := f_s + (f_tl + f_e);
      if f_w <> 0 and ((f_s - (k_r - (k_r - f_s))) + ((f_tl + f_e) - (k_r - f_s))) <> 0 and (k_r + 2 * ((f_s - (k_r - (k_r - f_s))) + ((f_tl + f_e) - (k_r - f_s)))) - k_r = 2 * ((f_s - (k_r - (k_r - f_s))) + ((f_tl + f_e) - (k_r - f_s))) and (f_w < 0) = (((f_s - (k_r - (k_r - f_s))) + ((f_tl + f_e) - (k_r - f_s))) < 0) then k_r := k_r + 2 * ((f_s - (k_r - (k_r - f_s))) + ((f_tl + f_e) - (k_r - f_s))); end if;
    elsif k_z = 0 or (-1.13596475577881948265e-11)::float8 = 0 then
      k_r := k_z * (-1.13596475577881948265e-11)::float8 + (2.08757232129817482790e-09)::float8;
    else
      k_r := fdlibm_fma_wide(a => k_z, b => (-1.13596475577881948265e-11)::float8, c => (2.08757232129817482790e-09)::float8);
    end if;
    if abs(k_z) >= 1e-144 and abs(k_z) <= 1e144 and abs(k_r) >= 1e-144 and abs(k_r) <= 1e144 and abs((-2.75573143513906633035e-07)::float8) <= 1e288 then
      f_p := k_z * k_r;
      f_ah := (k_z * 134217729 - (k_z * 134217729 - k_z));
      f_bh := (k_r * 134217729 - (k_r * 134217729 - k_r));
      f_e := (k_z - f_ah) * (k_r - f_bh) - (((f_p - f_ah * f_bh) - (k_z - f_ah) * f_bh) - f_ah * (k_r - f_bh));
      f_s := (-2.75573143513906633035e-07)::float8 + f_p;
      f_tl := ((-2.75573143513906633035e-07)::float8 - (f_s - (f_s - (-2.75573143513906633035e-07)::float8))) + (f_p - (f_s - (-2.75573143513906633035e-07)::float8));
      f_w := (f_tl - ((f_tl + f_e) - ((f_tl + f_e) - f_tl))) + (f_e - ((f_tl + f_e) - f_tl));
      k_r := f_s + (f_tl + f_e);
      if f_w <> 0 and ((f_s - (k_r - (k_r - f_s))) + ((f_tl + f_e) - (k_r - f_s))) <> 0 and (k_r + 2 * ((f_s - (k_r - (k_r - f_s))) + ((f_tl + f_e) - (k_r - f_s)))) - k_r = 2 * ((f_s - (k_r - (k_r - f_s))) + ((f_tl + f_e) - (k_r - f_s))) and (f_w < 0) = (((f_s - (k_r - (k_r - f_s))) + ((f_tl + f_e) - (k_r - f_s))) < 0) then k_r := k_r + 2 * ((f_s - (k_r - (k_r - f_s))) + ((f_tl + f_e) - (k_r - f_s))); end if;
    elsif k_z = 0 or k_r = 0 then
      k_r := k_z * k_r + (-2.75573143513906633035e-07)::float8;
    else
      k_r := fdlibm_fma_wide(a => k_z, b => k_r, c => (-2.75573143513906633035e-07)::float8);
    end if;
    if abs(k_z) >= 1e-144 and abs(k_z) <= 1e144 and abs(k_r) >= 1e-144 and abs(k_r) <= 1e144 and abs((2.48015872894767294178e-05)::float8) <= 1e288 then
      f_p := k_z * k_r;
      f_ah := (k_z * 134217729 - (k_z * 134217729 - k_z));
      f_bh := (k_r * 134217729 - (k_r * 134217729 - k_r));
      f_e := (k_z - f_ah) * (k_r - f_bh) - (((f_p - f_ah * f_bh) - (k_z - f_ah) * f_bh) - f_ah * (k_r - f_bh));
      f_s := (2.48015872894767294178e-05)::float8 + f_p;
      f_tl := ((2.48015872894767294178e-05)::float8 - (f_s - (f_s - (2.48015872894767294178e-05)::float8))) + (f_p - (f_s - (2.48015872894767294178e-05)::float8));
      f_w := (f_tl - ((f_tl + f_e) - ((f_tl + f_e) - f_tl))) + (f_e - ((f_tl + f_e) - f_tl));
      k_r := f_s + (f_tl + f_e);
      if f_w <> 0 and ((f_s - (k_r - (k_r - f_s))) + ((f_tl + f_e) - (k_r - f_s))) <> 0 and (k_r + 2 * ((f_s - (k_r - (k_r - f_s))) + ((f_tl + f_e) - (k_r - f_s)))) - k_r = 2 * ((f_s - (k_r - (k_r - f_s))) + ((f_tl + f_e) - (k_r - f_s))) and (f_w < 0) = (((f_s - (k_r - (k_r - f_s))) + ((f_tl + f_e) - (k_r - f_s))) < 0) then k_r := k_r + 2 * ((f_s - (k_r - (k_r - f_s))) + ((f_tl + f_e) - (k_r - f_s))); end if;
    elsif k_z = 0 or k_r = 0 then
      k_r := k_z * k_r + (2.48015872894767294178e-05)::float8;
    else
      k_r := fdlibm_fma_wide(a => k_z, b => k_r, c => (2.48015872894767294178e-05)::float8);
    end if;
    if abs(k_z) >= 1e-144 and abs(k_z) <= 1e144 and abs(k_r) >= 1e-144 and abs(k_r) <= 1e144 and abs((-1.38888888888741095749e-03)::float8) <= 1e288 then
      f_p := k_z * k_r;
      f_ah := (k_z * 134217729 - (k_z * 134217729 - k_z));
      f_bh := (k_r * 134217729 - (k_r * 134217729 - k_r));
      f_e := (k_z - f_ah) * (k_r - f_bh) - (((f_p - f_ah * f_bh) - (k_z - f_ah) * f_bh) - f_ah * (k_r - f_bh));
      f_s := (-1.38888888888741095749e-03)::float8 + f_p;
      f_tl := ((-1.38888888888741095749e-03)::float8 - (f_s - (f_s - (-1.38888888888741095749e-03)::float8))) + (f_p - (f_s - (-1.38888888888741095749e-03)::float8));
      f_w := (f_tl - ((f_tl + f_e) - ((f_tl + f_e) - f_tl))) + (f_e - ((f_tl + f_e) - f_tl));
      k_r := f_s + (f_tl + f_e);
      if f_w <> 0 and ((f_s - (k_r - (k_r - f_s))) + ((f_tl + f_e) - (k_r - f_s))) <> 0 and (k_r + 2 * ((f_s - (k_r - (k_r - f_s))) + ((f_tl + f_e) - (k_r - f_s)))) - k_r = 2 * ((f_s - (k_r - (k_r - f_s))) + ((f_tl + f_e) - (k_r - f_s))) and (f_w < 0) = (((f_s - (k_r - (k_r - f_s))) + ((f_tl + f_e) - (k_r - f_s))) < 0) then k_r := k_r + 2 * ((f_s - (k_r - (k_r - f_s))) + ((f_tl + f_e) - (k_r - f_s))); end if;
    elsif k_z = 0 or k_r = 0 then
      k_r := k_z * k_r + (-1.38888888888741095749e-03)::float8;
    else
      k_r := fdlibm_fma_wide(a => k_z, b => k_r, c => (-1.38888888888741095749e-03)::float8);
    end if;
    if abs(k_z) >= 1e-144 and abs(k_z) <= 1e144 and abs(k_r) >= 1e-144 and abs(k_r) <= 1e144 and abs((4.16666666666666019037e-02)::float8) <= 1e288 then
      f_p := k_z * k_r;
      f_ah := (k_z * 134217729 - (k_z * 134217729 - k_z));
      f_bh := (k_r * 134217729 - (k_r * 134217729 - k_r));
      f_e := (k_z - f_ah) * (k_r - f_bh) - (((f_p - f_ah * f_bh) - (k_z - f_ah) * f_bh) - f_ah * (k_r - f_bh));
      f_s := (4.16666666666666019037e-02)::float8 + f_p;
      f_tl := ((4.16666666666666019037e-02)::float8 - (f_s - (f_s - (4.16666666666666019037e-02)::float8))) + (f_p - (f_s - (4.16666666666666019037e-02)::float8));
      f_w := (f_tl - ((f_tl + f_e) - ((f_tl + f_e) - f_tl))) + (f_e - ((f_tl + f_e) - f_tl));
      k_r := f_s + (f_tl + f_e);
      if f_w <> 0 and ((f_s - (k_r - (k_r - f_s))) + ((f_tl + f_e) - (k_r - f_s))) <> 0 and (k_r + 2 * ((f_s - (k_r - (k_r - f_s))) + ((f_tl + f_e) - (k_r - f_s)))) - k_r = 2 * ((f_s - (k_r - (k_r - f_s))) + ((f_tl + f_e) - (k_r - f_s))) and (f_w < 0) = (((f_s - (k_r - (k_r - f_s))) + ((f_tl + f_e) - (k_r - f_s))) < 0) then k_r := k_r + 2 * ((f_s - (k_r - (k_r - f_s))) + ((f_tl + f_e) - (k_r - f_s))); end if;
    elsif k_z = 0 or k_r = 0 then
      k_r := k_z * k_r + (4.16666666666666019037e-02)::float8;
    else
      k_r := fdlibm_fma_wide(a => k_z, b => k_r, c => (4.16666666666666019037e-02)::float8);
    end if;
    k_r := k_z * k_r;
    f_c := -(y0 * y1);
    if abs(k_z) >= 1e-144 and abs(k_z) <= 1e144 and abs(k_r) >= 1e-144 and abs(k_r) <= 1e144 and abs(f_c) <= 1e288 then
      f_p := k_z * k_r;
      f_ah := (k_z * 134217729 - (k_z * 134217729 - k_z));
      f_bh := (k_r * 134217729 - (k_r * 134217729 - k_r));
      f_e := (k_z - f_ah) * (k_r - f_bh) - (((f_p - f_ah * f_bh) - (k_z - f_ah) * f_bh) - f_ah * (k_r - f_bh));
      f_s := f_c + f_p;
      f_tl := (f_c - (f_s - (f_s - f_c))) + (f_p - (f_s - f_c));
      f_w := (f_tl - ((f_tl + f_e) - ((f_tl + f_e) - f_tl))) + (f_e - ((f_tl + f_e) - f_tl));
      k_u := f_s + (f_tl + f_e);
      if f_w <> 0 and ((f_s - (k_u - (k_u - f_s))) + ((f_tl + f_e) - (k_u - f_s))) <> 0 and (k_u + 2 * ((f_s - (k_u - (k_u - f_s))) + ((f_tl + f_e) - (k_u - f_s)))) - k_u = 2 * ((f_s - (k_u - (k_u - f_s))) + ((f_tl + f_e) - (k_u - f_s))) and (f_w < 0) = (((f_s - (k_u - (k_u - f_s))) + ((f_tl + f_e) - (k_u - f_s))) < 0) then k_u := k_u + 2 * ((f_s - (k_u - (k_u - f_s))) + ((f_tl + f_e) - (k_u - f_s))); end if;
    elsif k_z = 0 or k_r = 0 then
      k_u := k_z * k_r + f_c;
    else
      k_u := fdlibm_fma_wide(a => k_z, b => k_r, c => f_c);
    end if;
    if k_ix < 0x3FD33333 then
      res := 1 - (0.5 * k_z - k_u);
    else
      k_q := case when k_ix > 0x3FE90000 then 0.28125 else (trunc((abs(y0)) * (('{2.2250738585072014e-308,4.1045368012983762e-289,7.571533991467358e-270,1.3967014978599092e-250,2.5764595078388533e-231,4.7527289157379e-212,8.767237396033612e-193,1.617269844780878e-173,2.983336292480083e-154,5.503284107318959e-135,1.0151767349262597e-115,1.8726705418768793e-96,3.454467422037778e-77,6.372367644529809e-58,1.1754943508222875e-38,2.168404344971009e-19,4,73786976294838210000,1.361129467683754e+39,2.5108406941546723e+58,4.631683569492648e+77,8.54394814368364e+96,1.5760802478557792e+116,2.9073548971824276e+135,5.363123171977039e+154,9.893216058924181e+173,1.824976247048878e+193,3.366486976990959e+212,6.210072369202836e+231,1.1455561567389984e+251,2.113178124542661e+270,3.89812560456e+289}'::float8[])[(((1043 - (((k_ix) >> 20) & 2047)) + 1022) >> 6) + 1] * ('{1,2,4,8,16,32,64,128,256,512,1024,2048,4096,8192,16384,32768,65536,131072,262144,524288,1048576,2097152,4194304,8388608,16777216,33554432,67108864,134217728,268435456,536870912,1073741824,2147483648,4294967296,8589934592,17179869184,34359738368,68719476736,137438953472,274877906944,549755813888,1099511627776,2199023255552,4398046511104,8796093022208,17592186044416,35184372088832,70368744177664,140737488355328,281474976710656,562949953421312,1125899906842624,2251799813685248,4503599627370496,9007199254740992,18014398509481984,36028797018963970,72057594037927940,144115188075855870,288230376151711740,576460752303423500,1152921504606847000,2305843009213694000,4611686018427388000,9223372036854776000}'::float8[])[(((1043 - (((k_ix) >> 20) & 2047)) + 1022) & 63) + 1])) * (('{2.2250738585072014e-308,4.1045368012983762e-289,7.571533991467358e-270,1.3967014978599092e-250,2.5764595078388533e-231,4.7527289157379e-212,8.767237396033612e-193,1.617269844780878e-173,2.983336292480083e-154,5.503284107318959e-135,1.0151767349262597e-115,1.8726705418768793e-96,3.454467422037778e-77,6.372367644529809e-58,1.1754943508222875e-38,2.168404344971009e-19,4,73786976294838210000,1.361129467683754e+39,2.5108406941546723e+58,4.631683569492648e+77,8.54394814368364e+96,1.5760802478557792e+116,2.9073548971824276e+135,5.363123171977039e+154,9.893216058924181e+173,1.824976247048878e+193,3.366486976990959e+212,6.210072369202836e+231,1.1455561567389984e+251,2.113178124542661e+270,3.89812560456e+289}'::float8[])[((((((k_ix) >> 20) & 2047) - 1043) + 1022) >> 6) + 1] * ('{1,2,4,8,16,32,64,128,256,512,1024,2048,4096,8192,16384,32768,65536,131072,262144,524288,1048576,2097152,4194304,8388608,16777216,33554432,67108864,134217728,268435456,536870912,1073741824,2147483648,4294967296,8589934592,17179869184,34359738368,68719476736,137438953472,274877906944,549755813888,1099511627776,2199023255552,4398046511104,8796093022208,17592186044416,35184372088832,70368744177664,140737488355328,281474976710656,562949953421312,1125899906842624,2251799813685248,4503599627370496,9007199254740992,18014398509481984,36028797018963970,72057594037927940,144115188075855870,288230376151711740,576460752303423500,1152921504606847000,2305843009213694000,4611686018427388000,9223372036854776000}'::float8[])[((((((k_ix) >> 20) & 2047) - 1043) + 1022) & 63) + 1])) * 0.25 end;
      res := (1 - k_q) - ((0.5 * k_z - k_q) - k_u);
    end if;
  end if;

  end if;
  return case when (case when 2 = 0 then n else n + 1 end & 2) = 2 then -res else res end;
end $$;


-- V8's asin (ieee754.cc; Math.asin). Products by 2 here are exact, so fused and unfused agree.
create function p3.fdlibm_asin(x float8) returns float8 language plpgsql immutable as $$
declare f_a float8; f_b float8; f_c float8; f_p float8; f_ah float8; f_bh float8; f_e float8; f_s float8; f_tl float8; f_w float8; hx int := (int8(float8send(x)) >> 32)::int; ix int := hx & 2147483647; t float8; w float8; p float8; q float8; c float8; r float8; s float8; u float8;
begin
  if ix >= 0x3FF00000 then
    if ix = 0x3FF00000 and (int8(float8send(x)) & 4294967295) = 0 then
      f_c := x * 6.12323399573676603587e-17;
      if abs(x) >= 1e-144 and abs(x) <= 1e144 and abs((1.57079632679489655800e+00)::float8) >= 1e-144 and abs((1.57079632679489655800e+00)::float8) <= 1e144 and abs(f_c) <= 1e288 then
        f_p := x * (1.57079632679489655800e+00)::float8;
        f_ah := (x * 134217729 - (x * 134217729 - x));
        f_e := (x - f_ah) * ((1.57079632679489655800e+00)::float8 - ((1.57079632679489655800e+00)::float8 * 134217729 - ((1.57079632679489655800e+00)::float8 * 134217729 - (1.57079632679489655800e+00)::float8))) - (((f_p - f_ah * ((1.57079632679489655800e+00)::float8 * 134217729 - ((1.57079632679489655800e+00)::float8 * 134217729 - (1.57079632679489655800e+00)::float8))) - (x - f_ah) * ((1.57079632679489655800e+00)::float8 * 134217729 - ((1.57079632679489655800e+00)::float8 * 134217729 - (1.57079632679489655800e+00)::float8))) - f_ah * ((1.57079632679489655800e+00)::float8 - ((1.57079632679489655800e+00)::float8 * 134217729 - ((1.57079632679489655800e+00)::float8 * 134217729 - (1.57079632679489655800e+00)::float8))));
        f_s := f_c + f_p;
        f_tl := (f_c - (f_s - (f_s - f_c))) + (f_p - (f_s - f_c));
        f_w := (f_tl - ((f_tl + f_e) - ((f_tl + f_e) - f_tl))) + (f_e - ((f_tl + f_e) - f_tl));
        u := f_s + (f_tl + f_e);
        if f_w <> 0 and ((f_s - (u - (u - f_s))) + ((f_tl + f_e) - (u - f_s))) <> 0 and (u + 2 * ((f_s - (u - (u - f_s))) + ((f_tl + f_e) - (u - f_s)))) - u = 2 * ((f_s - (u - (u - f_s))) + ((f_tl + f_e) - (u - f_s))) and (f_w < 0) = (((f_s - (u - (u - f_s))) + ((f_tl + f_e) - (u - f_s))) < 0) then u := u + 2 * ((f_s - (u - (u - f_s))) + ((f_tl + f_e) - (u - f_s))); end if;
      elsif x = 0 or (1.57079632679489655800e+00)::float8 = 0 then
        u := x * (1.57079632679489655800e+00)::float8 + f_c;
      else
        u := fdlibm_fma_wide(a => x, b => (1.57079632679489655800e+00)::float8, c => f_c);
      end if;
      return u;
    end if;
    return 'NaN';
  end if;
  if ix < 0x3FE00000 then
    if ix < 0x3E400000 then return x; end if;
    t := x * x;
  if abs(t) >= 1e-144 and abs(t) <= 1e144 and abs((3.47933107596021167570e-05)::float8) >= 1e-144 and abs((3.47933107596021167570e-05)::float8) <= 1e144 and abs((7.91534994289814532176e-04)::float8) <= 1e288 then
    f_p := t * (3.47933107596021167570e-05)::float8;
    f_ah := (t * 134217729 - (t * 134217729 - t));
    f_e := (t - f_ah) * ((3.47933107596021167570e-05)::float8 - ((3.47933107596021167570e-05)::float8 * 134217729 - ((3.47933107596021167570e-05)::float8 * 134217729 - (3.47933107596021167570e-05)::float8))) - (((f_p - f_ah * ((3.47933107596021167570e-05)::float8 * 134217729 - ((3.47933107596021167570e-05)::float8 * 134217729 - (3.47933107596021167570e-05)::float8))) - (t - f_ah) * ((3.47933107596021167570e-05)::float8 * 134217729 - ((3.47933107596021167570e-05)::float8 * 134217729 - (3.47933107596021167570e-05)::float8))) - f_ah * ((3.47933107596021167570e-05)::float8 - ((3.47933107596021167570e-05)::float8 * 134217729 - ((3.47933107596021167570e-05)::float8 * 134217729 - (3.47933107596021167570e-05)::float8))));
    f_s := (7.91534994289814532176e-04)::float8 + f_p;
    f_tl := ((7.91534994289814532176e-04)::float8 - (f_s - (f_s - (7.91534994289814532176e-04)::float8))) + (f_p - (f_s - (7.91534994289814532176e-04)::float8));
    f_w := (f_tl - ((f_tl + f_e) - ((f_tl + f_e) - f_tl))) + (f_e - ((f_tl + f_e) - f_tl));
    p := f_s + (f_tl + f_e);
    if f_w <> 0 and ((f_s - (p - (p - f_s))) + ((f_tl + f_e) - (p - f_s))) <> 0 and (p + 2 * ((f_s - (p - (p - f_s))) + ((f_tl + f_e) - (p - f_s)))) - p = 2 * ((f_s - (p - (p - f_s))) + ((f_tl + f_e) - (p - f_s))) and (f_w < 0) = (((f_s - (p - (p - f_s))) + ((f_tl + f_e) - (p - f_s))) < 0) then p := p + 2 * ((f_s - (p - (p - f_s))) + ((f_tl + f_e) - (p - f_s))); end if;
  elsif t = 0 or (3.47933107596021167570e-05)::float8 = 0 then
    p := t * (3.47933107596021167570e-05)::float8 + (7.91534994289814532176e-04)::float8;
  else
    p := fdlibm_fma_wide(a => t, b => (3.47933107596021167570e-05)::float8, c => (7.91534994289814532176e-04)::float8);
  end if;
  if abs(t) >= 1e-144 and abs(t) <= 1e144 and abs(p) >= 1e-144 and abs(p) <= 1e144 and abs((-4.00555345006794114027e-02)::float8) <= 1e288 then
    f_p := t * p;
    f_ah := (t * 134217729 - (t * 134217729 - t));
    f_bh := (p * 134217729 - (p * 134217729 - p));
    f_e := (t - f_ah) * (p - f_bh) - (((f_p - f_ah * f_bh) - (t - f_ah) * f_bh) - f_ah * (p - f_bh));
    f_s := (-4.00555345006794114027e-02)::float8 + f_p;
    f_tl := ((-4.00555345006794114027e-02)::float8 - (f_s - (f_s - (-4.00555345006794114027e-02)::float8))) + (f_p - (f_s - (-4.00555345006794114027e-02)::float8));
    f_w := (f_tl - ((f_tl + f_e) - ((f_tl + f_e) - f_tl))) + (f_e - ((f_tl + f_e) - f_tl));
    p := f_s + (f_tl + f_e);
    if f_w <> 0 and ((f_s - (p - (p - f_s))) + ((f_tl + f_e) - (p - f_s))) <> 0 and (p + 2 * ((f_s - (p - (p - f_s))) + ((f_tl + f_e) - (p - f_s)))) - p = 2 * ((f_s - (p - (p - f_s))) + ((f_tl + f_e) - (p - f_s))) and (f_w < 0) = (((f_s - (p - (p - f_s))) + ((f_tl + f_e) - (p - f_s))) < 0) then p := p + 2 * ((f_s - (p - (p - f_s))) + ((f_tl + f_e) - (p - f_s))); end if;
  elsif t = 0 or p = 0 then
    p := t * p + (-4.00555345006794114027e-02)::float8;
  else
    p := fdlibm_fma_wide(a => t, b => p, c => (-4.00555345006794114027e-02)::float8);
  end if;
  if abs(t) >= 1e-144 and abs(t) <= 1e144 and abs(p) >= 1e-144 and abs(p) <= 1e144 and abs((2.01212532134862925881e-01)::float8) <= 1e288 then
    f_p := t * p;
    f_ah := (t * 134217729 - (t * 134217729 - t));
    f_bh := (p * 134217729 - (p * 134217729 - p));
    f_e := (t - f_ah) * (p - f_bh) - (((f_p - f_ah * f_bh) - (t - f_ah) * f_bh) - f_ah * (p - f_bh));
    f_s := (2.01212532134862925881e-01)::float8 + f_p;
    f_tl := ((2.01212532134862925881e-01)::float8 - (f_s - (f_s - (2.01212532134862925881e-01)::float8))) + (f_p - (f_s - (2.01212532134862925881e-01)::float8));
    f_w := (f_tl - ((f_tl + f_e) - ((f_tl + f_e) - f_tl))) + (f_e - ((f_tl + f_e) - f_tl));
    p := f_s + (f_tl + f_e);
    if f_w <> 0 and ((f_s - (p - (p - f_s))) + ((f_tl + f_e) - (p - f_s))) <> 0 and (p + 2 * ((f_s - (p - (p - f_s))) + ((f_tl + f_e) - (p - f_s)))) - p = 2 * ((f_s - (p - (p - f_s))) + ((f_tl + f_e) - (p - f_s))) and (f_w < 0) = (((f_s - (p - (p - f_s))) + ((f_tl + f_e) - (p - f_s))) < 0) then p := p + 2 * ((f_s - (p - (p - f_s))) + ((f_tl + f_e) - (p - f_s))); end if;
  elsif t = 0 or p = 0 then
    p := t * p + (2.01212532134862925881e-01)::float8;
  else
    p := fdlibm_fma_wide(a => t, b => p, c => (2.01212532134862925881e-01)::float8);
  end if;
  if abs(t) >= 1e-144 and abs(t) <= 1e144 and abs(p) >= 1e-144 and abs(p) <= 1e144 and abs((-3.25565818622400915405e-01)::float8) <= 1e288 then
    f_p := t * p;
    f_ah := (t * 134217729 - (t * 134217729 - t));
    f_bh := (p * 134217729 - (p * 134217729 - p));
    f_e := (t - f_ah) * (p - f_bh) - (((f_p - f_ah * f_bh) - (t - f_ah) * f_bh) - f_ah * (p - f_bh));
    f_s := (-3.25565818622400915405e-01)::float8 + f_p;
    f_tl := ((-3.25565818622400915405e-01)::float8 - (f_s - (f_s - (-3.25565818622400915405e-01)::float8))) + (f_p - (f_s - (-3.25565818622400915405e-01)::float8));
    f_w := (f_tl - ((f_tl + f_e) - ((f_tl + f_e) - f_tl))) + (f_e - ((f_tl + f_e) - f_tl));
    p := f_s + (f_tl + f_e);
    if f_w <> 0 and ((f_s - (p - (p - f_s))) + ((f_tl + f_e) - (p - f_s))) <> 0 and (p + 2 * ((f_s - (p - (p - f_s))) + ((f_tl + f_e) - (p - f_s)))) - p = 2 * ((f_s - (p - (p - f_s))) + ((f_tl + f_e) - (p - f_s))) and (f_w < 0) = (((f_s - (p - (p - f_s))) + ((f_tl + f_e) - (p - f_s))) < 0) then p := p + 2 * ((f_s - (p - (p - f_s))) + ((f_tl + f_e) - (p - f_s))); end if;
  elsif t = 0 or p = 0 then
    p := t * p + (-3.25565818622400915405e-01)::float8;
  else
    p := fdlibm_fma_wide(a => t, b => p, c => (-3.25565818622400915405e-01)::float8);
  end if;
  if abs(t) >= 1e-144 and abs(t) <= 1e144 and abs(p) >= 1e-144 and abs(p) <= 1e144 and abs((1.66666666666666657415e-01)::float8) <= 1e288 then
    f_p := t * p;
    f_ah := (t * 134217729 - (t * 134217729 - t));
    f_bh := (p * 134217729 - (p * 134217729 - p));
    f_e := (t - f_ah) * (p - f_bh) - (((f_p - f_ah * f_bh) - (t - f_ah) * f_bh) - f_ah * (p - f_bh));
    f_s := (1.66666666666666657415e-01)::float8 + f_p;
    f_tl := ((1.66666666666666657415e-01)::float8 - (f_s - (f_s - (1.66666666666666657415e-01)::float8))) + (f_p - (f_s - (1.66666666666666657415e-01)::float8));
    f_w := (f_tl - ((f_tl + f_e) - ((f_tl + f_e) - f_tl))) + (f_e - ((f_tl + f_e) - f_tl));
    p := f_s + (f_tl + f_e);
    if f_w <> 0 and ((f_s - (p - (p - f_s))) + ((f_tl + f_e) - (p - f_s))) <> 0 and (p + 2 * ((f_s - (p - (p - f_s))) + ((f_tl + f_e) - (p - f_s)))) - p = 2 * ((f_s - (p - (p - f_s))) + ((f_tl + f_e) - (p - f_s))) and (f_w < 0) = (((f_s - (p - (p - f_s))) + ((f_tl + f_e) - (p - f_s))) < 0) then p := p + 2 * ((f_s - (p - (p - f_s))) + ((f_tl + f_e) - (p - f_s))); end if;
  elsif t = 0 or p = 0 then
    p := t * p + (1.66666666666666657415e-01)::float8;
  else
    p := fdlibm_fma_wide(a => t, b => p, c => (1.66666666666666657415e-01)::float8);
  end if;
  p := t * p;
  if abs(t) >= 1e-144 and abs(t) <= 1e144 and abs((7.70381505559019352791e-02)::float8) >= 1e-144 and abs((7.70381505559019352791e-02)::float8) <= 1e144 and abs((-6.88283971605453293030e-01)::float8) <= 1e288 then
    f_p := t * (7.70381505559019352791e-02)::float8;
    f_ah := (t * 134217729 - (t * 134217729 - t));
    f_e := (t - f_ah) * ((7.70381505559019352791e-02)::float8 - ((7.70381505559019352791e-02)::float8 * 134217729 - ((7.70381505559019352791e-02)::float8 * 134217729 - (7.70381505559019352791e-02)::float8))) - (((f_p - f_ah * ((7.70381505559019352791e-02)::float8 * 134217729 - ((7.70381505559019352791e-02)::float8 * 134217729 - (7.70381505559019352791e-02)::float8))) - (t - f_ah) * ((7.70381505559019352791e-02)::float8 * 134217729 - ((7.70381505559019352791e-02)::float8 * 134217729 - (7.70381505559019352791e-02)::float8))) - f_ah * ((7.70381505559019352791e-02)::float8 - ((7.70381505559019352791e-02)::float8 * 134217729 - ((7.70381505559019352791e-02)::float8 * 134217729 - (7.70381505559019352791e-02)::float8))));
    f_s := (-6.88283971605453293030e-01)::float8 + f_p;
    f_tl := ((-6.88283971605453293030e-01)::float8 - (f_s - (f_s - (-6.88283971605453293030e-01)::float8))) + (f_p - (f_s - (-6.88283971605453293030e-01)::float8));
    f_w := (f_tl - ((f_tl + f_e) - ((f_tl + f_e) - f_tl))) + (f_e - ((f_tl + f_e) - f_tl));
    q := f_s + (f_tl + f_e);
    if f_w <> 0 and ((f_s - (q - (q - f_s))) + ((f_tl + f_e) - (q - f_s))) <> 0 and (q + 2 * ((f_s - (q - (q - f_s))) + ((f_tl + f_e) - (q - f_s)))) - q = 2 * ((f_s - (q - (q - f_s))) + ((f_tl + f_e) - (q - f_s))) and (f_w < 0) = (((f_s - (q - (q - f_s))) + ((f_tl + f_e) - (q - f_s))) < 0) then q := q + 2 * ((f_s - (q - (q - f_s))) + ((f_tl + f_e) - (q - f_s))); end if;
  elsif t = 0 or (7.70381505559019352791e-02)::float8 = 0 then
    q := t * (7.70381505559019352791e-02)::float8 + (-6.88283971605453293030e-01)::float8;
  else
    q := fdlibm_fma_wide(a => t, b => (7.70381505559019352791e-02)::float8, c => (-6.88283971605453293030e-01)::float8);
  end if;
  if abs(t) >= 1e-144 and abs(t) <= 1e144 and abs(q) >= 1e-144 and abs(q) <= 1e144 and abs((2.02094576023350569471e+00)::float8) <= 1e288 then
    f_p := t * q;
    f_ah := (t * 134217729 - (t * 134217729 - t));
    f_bh := (q * 134217729 - (q * 134217729 - q));
    f_e := (t - f_ah) * (q - f_bh) - (((f_p - f_ah * f_bh) - (t - f_ah) * f_bh) - f_ah * (q - f_bh));
    f_s := (2.02094576023350569471e+00)::float8 + f_p;
    f_tl := ((2.02094576023350569471e+00)::float8 - (f_s - (f_s - (2.02094576023350569471e+00)::float8))) + (f_p - (f_s - (2.02094576023350569471e+00)::float8));
    f_w := (f_tl - ((f_tl + f_e) - ((f_tl + f_e) - f_tl))) + (f_e - ((f_tl + f_e) - f_tl));
    q := f_s + (f_tl + f_e);
    if f_w <> 0 and ((f_s - (q - (q - f_s))) + ((f_tl + f_e) - (q - f_s))) <> 0 and (q + 2 * ((f_s - (q - (q - f_s))) + ((f_tl + f_e) - (q - f_s)))) - q = 2 * ((f_s - (q - (q - f_s))) + ((f_tl + f_e) - (q - f_s))) and (f_w < 0) = (((f_s - (q - (q - f_s))) + ((f_tl + f_e) - (q - f_s))) < 0) then q := q + 2 * ((f_s - (q - (q - f_s))) + ((f_tl + f_e) - (q - f_s))); end if;
  elsif t = 0 or q = 0 then
    q := t * q + (2.02094576023350569471e+00)::float8;
  else
    q := fdlibm_fma_wide(a => t, b => q, c => (2.02094576023350569471e+00)::float8);
  end if;
  if abs(t) >= 1e-144 and abs(t) <= 1e144 and abs(q) >= 1e-144 and abs(q) <= 1e144 and abs((-2.40339491173441421878e+00)::float8) <= 1e288 then
    f_p := t * q;
    f_ah := (t * 134217729 - (t * 134217729 - t));
    f_bh := (q * 134217729 - (q * 134217729 - q));
    f_e := (t - f_ah) * (q - f_bh) - (((f_p - f_ah * f_bh) - (t - f_ah) * f_bh) - f_ah * (q - f_bh));
    f_s := (-2.40339491173441421878e+00)::float8 + f_p;
    f_tl := ((-2.40339491173441421878e+00)::float8 - (f_s - (f_s - (-2.40339491173441421878e+00)::float8))) + (f_p - (f_s - (-2.40339491173441421878e+00)::float8));
    f_w := (f_tl - ((f_tl + f_e) - ((f_tl + f_e) - f_tl))) + (f_e - ((f_tl + f_e) - f_tl));
    q := f_s + (f_tl + f_e);
    if f_w <> 0 and ((f_s - (q - (q - f_s))) + ((f_tl + f_e) - (q - f_s))) <> 0 and (q + 2 * ((f_s - (q - (q - f_s))) + ((f_tl + f_e) - (q - f_s)))) - q = 2 * ((f_s - (q - (q - f_s))) + ((f_tl + f_e) - (q - f_s))) and (f_w < 0) = (((f_s - (q - (q - f_s))) + ((f_tl + f_e) - (q - f_s))) < 0) then q := q + 2 * ((f_s - (q - (q - f_s))) + ((f_tl + f_e) - (q - f_s))); end if;
  elsif t = 0 or q = 0 then
    q := t * q + (-2.40339491173441421878e+00)::float8;
  else
    q := fdlibm_fma_wide(a => t, b => q, c => (-2.40339491173441421878e+00)::float8);
  end if;
  if abs(t) >= 1e-144 and abs(t) <= 1e144 and abs(q) >= 1e-144 and abs(q) <= 1e144 and abs((1)::float8) <= 1e288 then
    f_p := t * q;
    f_ah := (t * 134217729 - (t * 134217729 - t));
    f_bh := (q * 134217729 - (q * 134217729 - q));
    f_e := (t - f_ah) * (q - f_bh) - (((f_p - f_ah * f_bh) - (t - f_ah) * f_bh) - f_ah * (q - f_bh));
    f_s := (1)::float8 + f_p;
    f_tl := ((1)::float8 - (f_s - (f_s - (1)::float8))) + (f_p - (f_s - (1)::float8));
    f_w := (f_tl - ((f_tl + f_e) - ((f_tl + f_e) - f_tl))) + (f_e - ((f_tl + f_e) - f_tl));
    q := f_s + (f_tl + f_e);
    if f_w <> 0 and ((f_s - (q - (q - f_s))) + ((f_tl + f_e) - (q - f_s))) <> 0 and (q + 2 * ((f_s - (q - (q - f_s))) + ((f_tl + f_e) - (q - f_s)))) - q = 2 * ((f_s - (q - (q - f_s))) + ((f_tl + f_e) - (q - f_s))) and (f_w < 0) = (((f_s - (q - (q - f_s))) + ((f_tl + f_e) - (q - f_s))) < 0) then q := q + 2 * ((f_s - (q - (q - f_s))) + ((f_tl + f_e) - (q - f_s))); end if;
  elsif t = 0 or q = 0 then
    q := t * q + (1)::float8;
  else
    q := fdlibm_fma_wide(a => t, b => q, c => (1)::float8);
  end if;

    w := p / q;
    if abs(x) >= 1e-144 and abs(x) <= 1e144 and abs(w) >= 1e-144 and abs(w) <= 1e144 and abs(x) <= 1e288 then
      f_p := x * w;
      f_ah := (x * 134217729 - (x * 134217729 - x));
      f_bh := (w * 134217729 - (w * 134217729 - w));
      f_e := (x - f_ah) * (w - f_bh) - (((f_p - f_ah * f_bh) - (x - f_ah) * f_bh) - f_ah * (w - f_bh));
      f_s := x + f_p;
      f_tl := (x - (f_s - (f_s - x))) + (f_p - (f_s - x));
      f_w := (f_tl - ((f_tl + f_e) - ((f_tl + f_e) - f_tl))) + (f_e - ((f_tl + f_e) - f_tl));
      u := f_s + (f_tl + f_e);
      if f_w <> 0 and ((f_s - (u - (u - f_s))) + ((f_tl + f_e) - (u - f_s))) <> 0 and (u + 2 * ((f_s - (u - (u - f_s))) + ((f_tl + f_e) - (u - f_s)))) - u = 2 * ((f_s - (u - (u - f_s))) + ((f_tl + f_e) - (u - f_s))) and (f_w < 0) = (((f_s - (u - (u - f_s))) + ((f_tl + f_e) - (u - f_s))) < 0) then u := u + 2 * ((f_s - (u - (u - f_s))) + ((f_tl + f_e) - (u - f_s))); end if;
    elsif x = 0 or w = 0 then
      u := x * w + x;
    else
      u := fdlibm_fma_wide(a => x, b => w, c => x);
    end if;
    return u;
  end if;
  w := 1 - abs(x);
  t := w * 0.5;
  if abs(t) >= 1e-144 and abs(t) <= 1e144 and abs((3.47933107596021167570e-05)::float8) >= 1e-144 and abs((3.47933107596021167570e-05)::float8) <= 1e144 and abs((7.91534994289814532176e-04)::float8) <= 1e288 then
    f_p := t * (3.47933107596021167570e-05)::float8;
    f_ah := (t * 134217729 - (t * 134217729 - t));
    f_e := (t - f_ah) * ((3.47933107596021167570e-05)::float8 - ((3.47933107596021167570e-05)::float8 * 134217729 - ((3.47933107596021167570e-05)::float8 * 134217729 - (3.47933107596021167570e-05)::float8))) - (((f_p - f_ah * ((3.47933107596021167570e-05)::float8 * 134217729 - ((3.47933107596021167570e-05)::float8 * 134217729 - (3.47933107596021167570e-05)::float8))) - (t - f_ah) * ((3.47933107596021167570e-05)::float8 * 134217729 - ((3.47933107596021167570e-05)::float8 * 134217729 - (3.47933107596021167570e-05)::float8))) - f_ah * ((3.47933107596021167570e-05)::float8 - ((3.47933107596021167570e-05)::float8 * 134217729 - ((3.47933107596021167570e-05)::float8 * 134217729 - (3.47933107596021167570e-05)::float8))));
    f_s := (7.91534994289814532176e-04)::float8 + f_p;
    f_tl := ((7.91534994289814532176e-04)::float8 - (f_s - (f_s - (7.91534994289814532176e-04)::float8))) + (f_p - (f_s - (7.91534994289814532176e-04)::float8));
    f_w := (f_tl - ((f_tl + f_e) - ((f_tl + f_e) - f_tl))) + (f_e - ((f_tl + f_e) - f_tl));
    p := f_s + (f_tl + f_e);
    if f_w <> 0 and ((f_s - (p - (p - f_s))) + ((f_tl + f_e) - (p - f_s))) <> 0 and (p + 2 * ((f_s - (p - (p - f_s))) + ((f_tl + f_e) - (p - f_s)))) - p = 2 * ((f_s - (p - (p - f_s))) + ((f_tl + f_e) - (p - f_s))) and (f_w < 0) = (((f_s - (p - (p - f_s))) + ((f_tl + f_e) - (p - f_s))) < 0) then p := p + 2 * ((f_s - (p - (p - f_s))) + ((f_tl + f_e) - (p - f_s))); end if;
  elsif t = 0 or (3.47933107596021167570e-05)::float8 = 0 then
    p := t * (3.47933107596021167570e-05)::float8 + (7.91534994289814532176e-04)::float8;
  else
    p := fdlibm_fma_wide(a => t, b => (3.47933107596021167570e-05)::float8, c => (7.91534994289814532176e-04)::float8);
  end if;
  if abs(t) >= 1e-144 and abs(t) <= 1e144 and abs(p) >= 1e-144 and abs(p) <= 1e144 and abs((-4.00555345006794114027e-02)::float8) <= 1e288 then
    f_p := t * p;
    f_ah := (t * 134217729 - (t * 134217729 - t));
    f_bh := (p * 134217729 - (p * 134217729 - p));
    f_e := (t - f_ah) * (p - f_bh) - (((f_p - f_ah * f_bh) - (t - f_ah) * f_bh) - f_ah * (p - f_bh));
    f_s := (-4.00555345006794114027e-02)::float8 + f_p;
    f_tl := ((-4.00555345006794114027e-02)::float8 - (f_s - (f_s - (-4.00555345006794114027e-02)::float8))) + (f_p - (f_s - (-4.00555345006794114027e-02)::float8));
    f_w := (f_tl - ((f_tl + f_e) - ((f_tl + f_e) - f_tl))) + (f_e - ((f_tl + f_e) - f_tl));
    p := f_s + (f_tl + f_e);
    if f_w <> 0 and ((f_s - (p - (p - f_s))) + ((f_tl + f_e) - (p - f_s))) <> 0 and (p + 2 * ((f_s - (p - (p - f_s))) + ((f_tl + f_e) - (p - f_s)))) - p = 2 * ((f_s - (p - (p - f_s))) + ((f_tl + f_e) - (p - f_s))) and (f_w < 0) = (((f_s - (p - (p - f_s))) + ((f_tl + f_e) - (p - f_s))) < 0) then p := p + 2 * ((f_s - (p - (p - f_s))) + ((f_tl + f_e) - (p - f_s))); end if;
  elsif t = 0 or p = 0 then
    p := t * p + (-4.00555345006794114027e-02)::float8;
  else
    p := fdlibm_fma_wide(a => t, b => p, c => (-4.00555345006794114027e-02)::float8);
  end if;
  if abs(t) >= 1e-144 and abs(t) <= 1e144 and abs(p) >= 1e-144 and abs(p) <= 1e144 and abs((2.01212532134862925881e-01)::float8) <= 1e288 then
    f_p := t * p;
    f_ah := (t * 134217729 - (t * 134217729 - t));
    f_bh := (p * 134217729 - (p * 134217729 - p));
    f_e := (t - f_ah) * (p - f_bh) - (((f_p - f_ah * f_bh) - (t - f_ah) * f_bh) - f_ah * (p - f_bh));
    f_s := (2.01212532134862925881e-01)::float8 + f_p;
    f_tl := ((2.01212532134862925881e-01)::float8 - (f_s - (f_s - (2.01212532134862925881e-01)::float8))) + (f_p - (f_s - (2.01212532134862925881e-01)::float8));
    f_w := (f_tl - ((f_tl + f_e) - ((f_tl + f_e) - f_tl))) + (f_e - ((f_tl + f_e) - f_tl));
    p := f_s + (f_tl + f_e);
    if f_w <> 0 and ((f_s - (p - (p - f_s))) + ((f_tl + f_e) - (p - f_s))) <> 0 and (p + 2 * ((f_s - (p - (p - f_s))) + ((f_tl + f_e) - (p - f_s)))) - p = 2 * ((f_s - (p - (p - f_s))) + ((f_tl + f_e) - (p - f_s))) and (f_w < 0) = (((f_s - (p - (p - f_s))) + ((f_tl + f_e) - (p - f_s))) < 0) then p := p + 2 * ((f_s - (p - (p - f_s))) + ((f_tl + f_e) - (p - f_s))); end if;
  elsif t = 0 or p = 0 then
    p := t * p + (2.01212532134862925881e-01)::float8;
  else
    p := fdlibm_fma_wide(a => t, b => p, c => (2.01212532134862925881e-01)::float8);
  end if;
  if abs(t) >= 1e-144 and abs(t) <= 1e144 and abs(p) >= 1e-144 and abs(p) <= 1e144 and abs((-3.25565818622400915405e-01)::float8) <= 1e288 then
    f_p := t * p;
    f_ah := (t * 134217729 - (t * 134217729 - t));
    f_bh := (p * 134217729 - (p * 134217729 - p));
    f_e := (t - f_ah) * (p - f_bh) - (((f_p - f_ah * f_bh) - (t - f_ah) * f_bh) - f_ah * (p - f_bh));
    f_s := (-3.25565818622400915405e-01)::float8 + f_p;
    f_tl := ((-3.25565818622400915405e-01)::float8 - (f_s - (f_s - (-3.25565818622400915405e-01)::float8))) + (f_p - (f_s - (-3.25565818622400915405e-01)::float8));
    f_w := (f_tl - ((f_tl + f_e) - ((f_tl + f_e) - f_tl))) + (f_e - ((f_tl + f_e) - f_tl));
    p := f_s + (f_tl + f_e);
    if f_w <> 0 and ((f_s - (p - (p - f_s))) + ((f_tl + f_e) - (p - f_s))) <> 0 and (p + 2 * ((f_s - (p - (p - f_s))) + ((f_tl + f_e) - (p - f_s)))) - p = 2 * ((f_s - (p - (p - f_s))) + ((f_tl + f_e) - (p - f_s))) and (f_w < 0) = (((f_s - (p - (p - f_s))) + ((f_tl + f_e) - (p - f_s))) < 0) then p := p + 2 * ((f_s - (p - (p - f_s))) + ((f_tl + f_e) - (p - f_s))); end if;
  elsif t = 0 or p = 0 then
    p := t * p + (-3.25565818622400915405e-01)::float8;
  else
    p := fdlibm_fma_wide(a => t, b => p, c => (-3.25565818622400915405e-01)::float8);
  end if;
  if abs(t) >= 1e-144 and abs(t) <= 1e144 and abs(p) >= 1e-144 and abs(p) <= 1e144 and abs((1.66666666666666657415e-01)::float8) <= 1e288 then
    f_p := t * p;
    f_ah := (t * 134217729 - (t * 134217729 - t));
    f_bh := (p * 134217729 - (p * 134217729 - p));
    f_e := (t - f_ah) * (p - f_bh) - (((f_p - f_ah * f_bh) - (t - f_ah) * f_bh) - f_ah * (p - f_bh));
    f_s := (1.66666666666666657415e-01)::float8 + f_p;
    f_tl := ((1.66666666666666657415e-01)::float8 - (f_s - (f_s - (1.66666666666666657415e-01)::float8))) + (f_p - (f_s - (1.66666666666666657415e-01)::float8));
    f_w := (f_tl - ((f_tl + f_e) - ((f_tl + f_e) - f_tl))) + (f_e - ((f_tl + f_e) - f_tl));
    p := f_s + (f_tl + f_e);
    if f_w <> 0 and ((f_s - (p - (p - f_s))) + ((f_tl + f_e) - (p - f_s))) <> 0 and (p + 2 * ((f_s - (p - (p - f_s))) + ((f_tl + f_e) - (p - f_s)))) - p = 2 * ((f_s - (p - (p - f_s))) + ((f_tl + f_e) - (p - f_s))) and (f_w < 0) = (((f_s - (p - (p - f_s))) + ((f_tl + f_e) - (p - f_s))) < 0) then p := p + 2 * ((f_s - (p - (p - f_s))) + ((f_tl + f_e) - (p - f_s))); end if;
  elsif t = 0 or p = 0 then
    p := t * p + (1.66666666666666657415e-01)::float8;
  else
    p := fdlibm_fma_wide(a => t, b => p, c => (1.66666666666666657415e-01)::float8);
  end if;
  p := t * p;
  if abs(t) >= 1e-144 and abs(t) <= 1e144 and abs((7.70381505559019352791e-02)::float8) >= 1e-144 and abs((7.70381505559019352791e-02)::float8) <= 1e144 and abs((-6.88283971605453293030e-01)::float8) <= 1e288 then
    f_p := t * (7.70381505559019352791e-02)::float8;
    f_ah := (t * 134217729 - (t * 134217729 - t));
    f_e := (t - f_ah) * ((7.70381505559019352791e-02)::float8 - ((7.70381505559019352791e-02)::float8 * 134217729 - ((7.70381505559019352791e-02)::float8 * 134217729 - (7.70381505559019352791e-02)::float8))) - (((f_p - f_ah * ((7.70381505559019352791e-02)::float8 * 134217729 - ((7.70381505559019352791e-02)::float8 * 134217729 - (7.70381505559019352791e-02)::float8))) - (t - f_ah) * ((7.70381505559019352791e-02)::float8 * 134217729 - ((7.70381505559019352791e-02)::float8 * 134217729 - (7.70381505559019352791e-02)::float8))) - f_ah * ((7.70381505559019352791e-02)::float8 - ((7.70381505559019352791e-02)::float8 * 134217729 - ((7.70381505559019352791e-02)::float8 * 134217729 - (7.70381505559019352791e-02)::float8))));
    f_s := (-6.88283971605453293030e-01)::float8 + f_p;
    f_tl := ((-6.88283971605453293030e-01)::float8 - (f_s - (f_s - (-6.88283971605453293030e-01)::float8))) + (f_p - (f_s - (-6.88283971605453293030e-01)::float8));
    f_w := (f_tl - ((f_tl + f_e) - ((f_tl + f_e) - f_tl))) + (f_e - ((f_tl + f_e) - f_tl));
    q := f_s + (f_tl + f_e);
    if f_w <> 0 and ((f_s - (q - (q - f_s))) + ((f_tl + f_e) - (q - f_s))) <> 0 and (q + 2 * ((f_s - (q - (q - f_s))) + ((f_tl + f_e) - (q - f_s)))) - q = 2 * ((f_s - (q - (q - f_s))) + ((f_tl + f_e) - (q - f_s))) and (f_w < 0) = (((f_s - (q - (q - f_s))) + ((f_tl + f_e) - (q - f_s))) < 0) then q := q + 2 * ((f_s - (q - (q - f_s))) + ((f_tl + f_e) - (q - f_s))); end if;
  elsif t = 0 or (7.70381505559019352791e-02)::float8 = 0 then
    q := t * (7.70381505559019352791e-02)::float8 + (-6.88283971605453293030e-01)::float8;
  else
    q := fdlibm_fma_wide(a => t, b => (7.70381505559019352791e-02)::float8, c => (-6.88283971605453293030e-01)::float8);
  end if;
  if abs(t) >= 1e-144 and abs(t) <= 1e144 and abs(q) >= 1e-144 and abs(q) <= 1e144 and abs((2.02094576023350569471e+00)::float8) <= 1e288 then
    f_p := t * q;
    f_ah := (t * 134217729 - (t * 134217729 - t));
    f_bh := (q * 134217729 - (q * 134217729 - q));
    f_e := (t - f_ah) * (q - f_bh) - (((f_p - f_ah * f_bh) - (t - f_ah) * f_bh) - f_ah * (q - f_bh));
    f_s := (2.02094576023350569471e+00)::float8 + f_p;
    f_tl := ((2.02094576023350569471e+00)::float8 - (f_s - (f_s - (2.02094576023350569471e+00)::float8))) + (f_p - (f_s - (2.02094576023350569471e+00)::float8));
    f_w := (f_tl - ((f_tl + f_e) - ((f_tl + f_e) - f_tl))) + (f_e - ((f_tl + f_e) - f_tl));
    q := f_s + (f_tl + f_e);
    if f_w <> 0 and ((f_s - (q - (q - f_s))) + ((f_tl + f_e) - (q - f_s))) <> 0 and (q + 2 * ((f_s - (q - (q - f_s))) + ((f_tl + f_e) - (q - f_s)))) - q = 2 * ((f_s - (q - (q - f_s))) + ((f_tl + f_e) - (q - f_s))) and (f_w < 0) = (((f_s - (q - (q - f_s))) + ((f_tl + f_e) - (q - f_s))) < 0) then q := q + 2 * ((f_s - (q - (q - f_s))) + ((f_tl + f_e) - (q - f_s))); end if;
  elsif t = 0 or q = 0 then
    q := t * q + (2.02094576023350569471e+00)::float8;
  else
    q := fdlibm_fma_wide(a => t, b => q, c => (2.02094576023350569471e+00)::float8);
  end if;
  if abs(t) >= 1e-144 and abs(t) <= 1e144 and abs(q) >= 1e-144 and abs(q) <= 1e144 and abs((-2.40339491173441421878e+00)::float8) <= 1e288 then
    f_p := t * q;
    f_ah := (t * 134217729 - (t * 134217729 - t));
    f_bh := (q * 134217729 - (q * 134217729 - q));
    f_e := (t - f_ah) * (q - f_bh) - (((f_p - f_ah * f_bh) - (t - f_ah) * f_bh) - f_ah * (q - f_bh));
    f_s := (-2.40339491173441421878e+00)::float8 + f_p;
    f_tl := ((-2.40339491173441421878e+00)::float8 - (f_s - (f_s - (-2.40339491173441421878e+00)::float8))) + (f_p - (f_s - (-2.40339491173441421878e+00)::float8));
    f_w := (f_tl - ((f_tl + f_e) - ((f_tl + f_e) - f_tl))) + (f_e - ((f_tl + f_e) - f_tl));
    q := f_s + (f_tl + f_e);
    if f_w <> 0 and ((f_s - (q - (q - f_s))) + ((f_tl + f_e) - (q - f_s))) <> 0 and (q + 2 * ((f_s - (q - (q - f_s))) + ((f_tl + f_e) - (q - f_s)))) - q = 2 * ((f_s - (q - (q - f_s))) + ((f_tl + f_e) - (q - f_s))) and (f_w < 0) = (((f_s - (q - (q - f_s))) + ((f_tl + f_e) - (q - f_s))) < 0) then q := q + 2 * ((f_s - (q - (q - f_s))) + ((f_tl + f_e) - (q - f_s))); end if;
  elsif t = 0 or q = 0 then
    q := t * q + (-2.40339491173441421878e+00)::float8;
  else
    q := fdlibm_fma_wide(a => t, b => q, c => (-2.40339491173441421878e+00)::float8);
  end if;
  if abs(t) >= 1e-144 and abs(t) <= 1e144 and abs(q) >= 1e-144 and abs(q) <= 1e144 and abs((1)::float8) <= 1e288 then
    f_p := t * q;
    f_ah := (t * 134217729 - (t * 134217729 - t));
    f_bh := (q * 134217729 - (q * 134217729 - q));
    f_e := (t - f_ah) * (q - f_bh) - (((f_p - f_ah * f_bh) - (t - f_ah) * f_bh) - f_ah * (q - f_bh));
    f_s := (1)::float8 + f_p;
    f_tl := ((1)::float8 - (f_s - (f_s - (1)::float8))) + (f_p - (f_s - (1)::float8));
    f_w := (f_tl - ((f_tl + f_e) - ((f_tl + f_e) - f_tl))) + (f_e - ((f_tl + f_e) - f_tl));
    q := f_s + (f_tl + f_e);
    if f_w <> 0 and ((f_s - (q - (q - f_s))) + ((f_tl + f_e) - (q - f_s))) <> 0 and (q + 2 * ((f_s - (q - (q - f_s))) + ((f_tl + f_e) - (q - f_s)))) - q = 2 * ((f_s - (q - (q - f_s))) + ((f_tl + f_e) - (q - f_s))) and (f_w < 0) = (((f_s - (q - (q - f_s))) + ((f_tl + f_e) - (q - f_s))) < 0) then q := q + 2 * ((f_s - (q - (q - f_s))) + ((f_tl + f_e) - (q - f_s))); end if;
  elsif t = 0 or q = 0 then
    q := t * q + (1)::float8;
  else
    q := fdlibm_fma_wide(a => t, b => q, c => (1)::float8);
  end if;

  s := sqrt(t);
  if ix >= 0x3FEF3333 then
    w := p / q;
    if abs(s) >= 1e-144 and abs(s) <= 1e144 and abs(w) >= 1e-144 and abs(w) <= 1e144 and abs(s) <= 1e288 then
      f_p := s * w;
      f_ah := (s * 134217729 - (s * 134217729 - s));
      f_bh := (w * 134217729 - (w * 134217729 - w));
      f_e := (s - f_ah) * (w - f_bh) - (((f_p - f_ah * f_bh) - (s - f_ah) * f_bh) - f_ah * (w - f_bh));
      f_s := s + f_p;
      f_tl := (s - (f_s - (f_s - s))) + (f_p - (f_s - s));
      f_w := (f_tl - ((f_tl + f_e) - ((f_tl + f_e) - f_tl))) + (f_e - ((f_tl + f_e) - f_tl));
      u := f_s + (f_tl + f_e);
      if f_w <> 0 and ((f_s - (u - (u - f_s))) + ((f_tl + f_e) - (u - f_s))) <> 0 and (u + 2 * ((f_s - (u - (u - f_s))) + ((f_tl + f_e) - (u - f_s)))) - u = 2 * ((f_s - (u - (u - f_s))) + ((f_tl + f_e) - (u - f_s))) and (f_w < 0) = (((f_s - (u - (u - f_s))) + ((f_tl + f_e) - (u - f_s))) < 0) then u := u + 2 * ((f_s - (u - (u - f_s))) + ((f_tl + f_e) - (u - f_s))); end if;
    elsif s = 0 or w = 0 then
      u := s * w + s;
    else
      u := fdlibm_fma_wide(a => s, b => w, c => s);
    end if;
    t := 1.57079632679489655800e+00 - (2 * u - 6.12323399573676603587e-17);
  else
    w := (trunc((s) * (('{2.2250738585072014e-308,4.1045368012983762e-289,7.571533991467358e-270,1.3967014978599092e-250,2.5764595078388533e-231,4.7527289157379e-212,8.767237396033612e-193,1.617269844780878e-173,2.983336292480083e-154,5.503284107318959e-135,1.0151767349262597e-115,1.8726705418768793e-96,3.454467422037778e-77,6.372367644529809e-58,1.1754943508222875e-38,2.168404344971009e-19,4,73786976294838210000,1.361129467683754e+39,2.5108406941546723e+58,4.631683569492648e+77,8.54394814368364e+96,1.5760802478557792e+116,2.9073548971824276e+135,5.363123171977039e+154,9.893216058924181e+173,1.824976247048878e+193,3.366486976990959e+212,6.210072369202836e+231,1.1455561567389984e+251,2.113178124542661e+270,3.89812560456e+289}'::float8[])[(((1043 - ((((int8(float8send(s)) >> 32)::int) >> 20) & 2047)) + 1022) >> 6) + 1] * ('{1,2,4,8,16,32,64,128,256,512,1024,2048,4096,8192,16384,32768,65536,131072,262144,524288,1048576,2097152,4194304,8388608,16777216,33554432,67108864,134217728,268435456,536870912,1073741824,2147483648,4294967296,8589934592,17179869184,34359738368,68719476736,137438953472,274877906944,549755813888,1099511627776,2199023255552,4398046511104,8796093022208,17592186044416,35184372088832,70368744177664,140737488355328,281474976710656,562949953421312,1125899906842624,2251799813685248,4503599627370496,9007199254740992,18014398509481984,36028797018963970,72057594037927940,144115188075855870,288230376151711740,576460752303423500,1152921504606847000,2305843009213694000,4611686018427388000,9223372036854776000}'::float8[])[(((1043 - ((((int8(float8send(s)) >> 32)::int) >> 20) & 2047)) + 1022) & 63) + 1])) * (('{2.2250738585072014e-308,4.1045368012983762e-289,7.571533991467358e-270,1.3967014978599092e-250,2.5764595078388533e-231,4.7527289157379e-212,8.767237396033612e-193,1.617269844780878e-173,2.983336292480083e-154,5.503284107318959e-135,1.0151767349262597e-115,1.8726705418768793e-96,3.454467422037778e-77,6.372367644529809e-58,1.1754943508222875e-38,2.168404344971009e-19,4,73786976294838210000,1.361129467683754e+39,2.5108406941546723e+58,4.631683569492648e+77,8.54394814368364e+96,1.5760802478557792e+116,2.9073548971824276e+135,5.363123171977039e+154,9.893216058924181e+173,1.824976247048878e+193,3.366486976990959e+212,6.210072369202836e+231,1.1455561567389984e+251,2.113178124542661e+270,3.89812560456e+289}'::float8[])[(((((((int8(float8send(s)) >> 32)::int) >> 20) & 2047) - 1043) + 1022) >> 6) + 1] * ('{1,2,4,8,16,32,64,128,256,512,1024,2048,4096,8192,16384,32768,65536,131072,262144,524288,1048576,2097152,4194304,8388608,16777216,33554432,67108864,134217728,268435456,536870912,1073741824,2147483648,4294967296,8589934592,17179869184,34359738368,68719476736,137438953472,274877906944,549755813888,1099511627776,2199023255552,4398046511104,8796093022208,17592186044416,35184372088832,70368744177664,140737488355328,281474976710656,562949953421312,1125899906842624,2251799813685248,4503599627370496,9007199254740992,18014398509481984,36028797018963970,72057594037927940,144115188075855870,288230376151711740,576460752303423500,1152921504606847000,2305843009213694000,4611686018427388000,9223372036854776000}'::float8[])[(((((((int8(float8send(s)) >> 32)::int) >> 20) & 2047) - 1043) + 1022) & 63) + 1]));
    if abs(-w) >= 1e-144 and abs(-w) <= 1e144 and abs(w) >= 1e-144 and abs(w) <= 1e144 and abs(t) <= 1e288 then
      f_p := -w * w;
      f_ah := (-w * 134217729 - (-w * 134217729 - -w));
      f_bh := (w * 134217729 - (w * 134217729 - w));
      f_e := (-w - f_ah) * (w - f_bh) - (((f_p - f_ah * f_bh) - (-w - f_ah) * f_bh) - f_ah * (w - f_bh));
      f_s := t + f_p;
      f_tl := (t - (f_s - (f_s - t))) + (f_p - (f_s - t));
      f_w := (f_tl - ((f_tl + f_e) - ((f_tl + f_e) - f_tl))) + (f_e - ((f_tl + f_e) - f_tl));
      u := f_s + (f_tl + f_e);
      if f_w <> 0 and ((f_s - (u - (u - f_s))) + ((f_tl + f_e) - (u - f_s))) <> 0 and (u + 2 * ((f_s - (u - (u - f_s))) + ((f_tl + f_e) - (u - f_s)))) - u = 2 * ((f_s - (u - (u - f_s))) + ((f_tl + f_e) - (u - f_s))) and (f_w < 0) = (((f_s - (u - (u - f_s))) + ((f_tl + f_e) - (u - f_s))) < 0) then u := u + 2 * ((f_s - (u - (u - f_s))) + ((f_tl + f_e) - (u - f_s))); end if;
    elsif -w = 0 or w = 0 then
      u := -w * w + t;
    else
      u := fdlibm_fma_wide(a => -w, b => w, c => t);
    end if;
    c := u / (s + w);
    r := p / q;
    f_c := -(6.12323399573676603587e-17 - 2 * c);
    if abs((2 * s)::float8) >= 1e-144 and abs((2 * s)::float8) <= 1e144 and abs(r) >= 1e-144 and abs(r) <= 1e144 and abs(f_c) <= 1e288 then
      f_p := (2 * s)::float8 * r;
      f_bh := (r * 134217729 - (r * 134217729 - r));
      f_e := ((2 * s)::float8 - ((2 * s)::float8 * 134217729 - ((2 * s)::float8 * 134217729 - (2 * s)::float8))) * (r - f_bh) - (((f_p - ((2 * s)::float8 * 134217729 - ((2 * s)::float8 * 134217729 - (2 * s)::float8)) * f_bh) - ((2 * s)::float8 - ((2 * s)::float8 * 134217729 - ((2 * s)::float8 * 134217729 - (2 * s)::float8))) * f_bh) - ((2 * s)::float8 * 134217729 - ((2 * s)::float8 * 134217729 - (2 * s)::float8)) * (r - f_bh));
      f_s := f_c + f_p;
      f_tl := (f_c - (f_s - (f_s - f_c))) + (f_p - (f_s - f_c));
      f_w := (f_tl - ((f_tl + f_e) - ((f_tl + f_e) - f_tl))) + (f_e - ((f_tl + f_e) - f_tl));
      p := f_s + (f_tl + f_e);
      if f_w <> 0 and ((f_s - (p - (p - f_s))) + ((f_tl + f_e) - (p - f_s))) <> 0 and (p + 2 * ((f_s - (p - (p - f_s))) + ((f_tl + f_e) - (p - f_s)))) - p = 2 * ((f_s - (p - (p - f_s))) + ((f_tl + f_e) - (p - f_s))) and (f_w < 0) = (((f_s - (p - (p - f_s))) + ((f_tl + f_e) - (p - f_s))) < 0) then p := p + 2 * ((f_s - (p - (p - f_s))) + ((f_tl + f_e) - (p - f_s))); end if;
    elsif (2 * s)::float8 = 0 or r = 0 then
      p := (2 * s)::float8 * r + f_c;
    else
      p := fdlibm_fma_wide(a => (2 * s)::float8, b => r, c => f_c);
    end if;
    q := 7.85398163397448278999e-01 - 2 * w;
    t := 7.85398163397448278999e-01 - (p - q);
  end if;
  return case when hx > 0 then t else -t end;
end $$;
-- V8's acos (ieee754.cc; Math.acos). Products by 2 here are exact, so fused and unfused agree.
create function p3.fdlibm_acos(x float8) returns float8 language plpgsql immutable as $$
declare f_a float8; f_b float8; f_c float8; f_p float8; f_ah float8; f_bh float8; f_e float8; f_s float8; f_tl float8; f_w float8; hx int := (int8(float8send(x)) >> 32)::int; ix int := hx & 2147483647; z float8; p float8; q float8; r float8; w float8; s float8; c float8; df float8; u float8;
begin
  if ix >= 0x3FF00000 then
    if ix = 0x3FF00000 and (int8(float8send(x)) & 4294967295) = 0 then
      return case when hx > 0 then 0 else 3.14159265358979311600e+00::float8 + 2 * 6.12323399573676603587e-17::float8 end;
    end if;
    return 'NaN';
  end if;
  if ix < 0x3FE00000 then
    if ix <= 0x3C600000 then return 1.57079632679489655800e+00::float8 + 6.12323399573676603587e-17::float8; end if;
    z := x * x;
  elsif hx < 0 then
    z := (1 + x) * 0.5;
  else
    z := (1 - x) * 0.5;
  end if;
  if abs(z) >= 1e-144 and abs(z) <= 1e144 and abs((3.47933107596021167570e-05)::float8) >= 1e-144 and abs((3.47933107596021167570e-05)::float8) <= 1e144 and abs((7.91534994289814532176e-04)::float8) <= 1e288 then
    f_p := z * (3.47933107596021167570e-05)::float8;
    f_ah := (z * 134217729 - (z * 134217729 - z));
    f_e := (z - f_ah) * ((3.47933107596021167570e-05)::float8 - ((3.47933107596021167570e-05)::float8 * 134217729 - ((3.47933107596021167570e-05)::float8 * 134217729 - (3.47933107596021167570e-05)::float8))) - (((f_p - f_ah * ((3.47933107596021167570e-05)::float8 * 134217729 - ((3.47933107596021167570e-05)::float8 * 134217729 - (3.47933107596021167570e-05)::float8))) - (z - f_ah) * ((3.47933107596021167570e-05)::float8 * 134217729 - ((3.47933107596021167570e-05)::float8 * 134217729 - (3.47933107596021167570e-05)::float8))) - f_ah * ((3.47933107596021167570e-05)::float8 - ((3.47933107596021167570e-05)::float8 * 134217729 - ((3.47933107596021167570e-05)::float8 * 134217729 - (3.47933107596021167570e-05)::float8))));
    f_s := (7.91534994289814532176e-04)::float8 + f_p;
    f_tl := ((7.91534994289814532176e-04)::float8 - (f_s - (f_s - (7.91534994289814532176e-04)::float8))) + (f_p - (f_s - (7.91534994289814532176e-04)::float8));
    f_w := (f_tl - ((f_tl + f_e) - ((f_tl + f_e) - f_tl))) + (f_e - ((f_tl + f_e) - f_tl));
    p := f_s + (f_tl + f_e);
    if f_w <> 0 and ((f_s - (p - (p - f_s))) + ((f_tl + f_e) - (p - f_s))) <> 0 and (p + 2 * ((f_s - (p - (p - f_s))) + ((f_tl + f_e) - (p - f_s)))) - p = 2 * ((f_s - (p - (p - f_s))) + ((f_tl + f_e) - (p - f_s))) and (f_w < 0) = (((f_s - (p - (p - f_s))) + ((f_tl + f_e) - (p - f_s))) < 0) then p := p + 2 * ((f_s - (p - (p - f_s))) + ((f_tl + f_e) - (p - f_s))); end if;
  elsif z = 0 or (3.47933107596021167570e-05)::float8 = 0 then
    p := z * (3.47933107596021167570e-05)::float8 + (7.91534994289814532176e-04)::float8;
  else
    p := fdlibm_fma_wide(a => z, b => (3.47933107596021167570e-05)::float8, c => (7.91534994289814532176e-04)::float8);
  end if;
  if abs(z) >= 1e-144 and abs(z) <= 1e144 and abs(p) >= 1e-144 and abs(p) <= 1e144 and abs((-4.00555345006794114027e-02)::float8) <= 1e288 then
    f_p := z * p;
    f_ah := (z * 134217729 - (z * 134217729 - z));
    f_bh := (p * 134217729 - (p * 134217729 - p));
    f_e := (z - f_ah) * (p - f_bh) - (((f_p - f_ah * f_bh) - (z - f_ah) * f_bh) - f_ah * (p - f_bh));
    f_s := (-4.00555345006794114027e-02)::float8 + f_p;
    f_tl := ((-4.00555345006794114027e-02)::float8 - (f_s - (f_s - (-4.00555345006794114027e-02)::float8))) + (f_p - (f_s - (-4.00555345006794114027e-02)::float8));
    f_w := (f_tl - ((f_tl + f_e) - ((f_tl + f_e) - f_tl))) + (f_e - ((f_tl + f_e) - f_tl));
    p := f_s + (f_tl + f_e);
    if f_w <> 0 and ((f_s - (p - (p - f_s))) + ((f_tl + f_e) - (p - f_s))) <> 0 and (p + 2 * ((f_s - (p - (p - f_s))) + ((f_tl + f_e) - (p - f_s)))) - p = 2 * ((f_s - (p - (p - f_s))) + ((f_tl + f_e) - (p - f_s))) and (f_w < 0) = (((f_s - (p - (p - f_s))) + ((f_tl + f_e) - (p - f_s))) < 0) then p := p + 2 * ((f_s - (p - (p - f_s))) + ((f_tl + f_e) - (p - f_s))); end if;
  elsif z = 0 or p = 0 then
    p := z * p + (-4.00555345006794114027e-02)::float8;
  else
    p := fdlibm_fma_wide(a => z, b => p, c => (-4.00555345006794114027e-02)::float8);
  end if;
  if abs(z) >= 1e-144 and abs(z) <= 1e144 and abs(p) >= 1e-144 and abs(p) <= 1e144 and abs((2.01212532134862925881e-01)::float8) <= 1e288 then
    f_p := z * p;
    f_ah := (z * 134217729 - (z * 134217729 - z));
    f_bh := (p * 134217729 - (p * 134217729 - p));
    f_e := (z - f_ah) * (p - f_bh) - (((f_p - f_ah * f_bh) - (z - f_ah) * f_bh) - f_ah * (p - f_bh));
    f_s := (2.01212532134862925881e-01)::float8 + f_p;
    f_tl := ((2.01212532134862925881e-01)::float8 - (f_s - (f_s - (2.01212532134862925881e-01)::float8))) + (f_p - (f_s - (2.01212532134862925881e-01)::float8));
    f_w := (f_tl - ((f_tl + f_e) - ((f_tl + f_e) - f_tl))) + (f_e - ((f_tl + f_e) - f_tl));
    p := f_s + (f_tl + f_e);
    if f_w <> 0 and ((f_s - (p - (p - f_s))) + ((f_tl + f_e) - (p - f_s))) <> 0 and (p + 2 * ((f_s - (p - (p - f_s))) + ((f_tl + f_e) - (p - f_s)))) - p = 2 * ((f_s - (p - (p - f_s))) + ((f_tl + f_e) - (p - f_s))) and (f_w < 0) = (((f_s - (p - (p - f_s))) + ((f_tl + f_e) - (p - f_s))) < 0) then p := p + 2 * ((f_s - (p - (p - f_s))) + ((f_tl + f_e) - (p - f_s))); end if;
  elsif z = 0 or p = 0 then
    p := z * p + (2.01212532134862925881e-01)::float8;
  else
    p := fdlibm_fma_wide(a => z, b => p, c => (2.01212532134862925881e-01)::float8);
  end if;
  if abs(z) >= 1e-144 and abs(z) <= 1e144 and abs(p) >= 1e-144 and abs(p) <= 1e144 and abs((-3.25565818622400915405e-01)::float8) <= 1e288 then
    f_p := z * p;
    f_ah := (z * 134217729 - (z * 134217729 - z));
    f_bh := (p * 134217729 - (p * 134217729 - p));
    f_e := (z - f_ah) * (p - f_bh) - (((f_p - f_ah * f_bh) - (z - f_ah) * f_bh) - f_ah * (p - f_bh));
    f_s := (-3.25565818622400915405e-01)::float8 + f_p;
    f_tl := ((-3.25565818622400915405e-01)::float8 - (f_s - (f_s - (-3.25565818622400915405e-01)::float8))) + (f_p - (f_s - (-3.25565818622400915405e-01)::float8));
    f_w := (f_tl - ((f_tl + f_e) - ((f_tl + f_e) - f_tl))) + (f_e - ((f_tl + f_e) - f_tl));
    p := f_s + (f_tl + f_e);
    if f_w <> 0 and ((f_s - (p - (p - f_s))) + ((f_tl + f_e) - (p - f_s))) <> 0 and (p + 2 * ((f_s - (p - (p - f_s))) + ((f_tl + f_e) - (p - f_s)))) - p = 2 * ((f_s - (p - (p - f_s))) + ((f_tl + f_e) - (p - f_s))) and (f_w < 0) = (((f_s - (p - (p - f_s))) + ((f_tl + f_e) - (p - f_s))) < 0) then p := p + 2 * ((f_s - (p - (p - f_s))) + ((f_tl + f_e) - (p - f_s))); end if;
  elsif z = 0 or p = 0 then
    p := z * p + (-3.25565818622400915405e-01)::float8;
  else
    p := fdlibm_fma_wide(a => z, b => p, c => (-3.25565818622400915405e-01)::float8);
  end if;
  if abs(z) >= 1e-144 and abs(z) <= 1e144 and abs(p) >= 1e-144 and abs(p) <= 1e144 and abs((1.66666666666666657415e-01)::float8) <= 1e288 then
    f_p := z * p;
    f_ah := (z * 134217729 - (z * 134217729 - z));
    f_bh := (p * 134217729 - (p * 134217729 - p));
    f_e := (z - f_ah) * (p - f_bh) - (((f_p - f_ah * f_bh) - (z - f_ah) * f_bh) - f_ah * (p - f_bh));
    f_s := (1.66666666666666657415e-01)::float8 + f_p;
    f_tl := ((1.66666666666666657415e-01)::float8 - (f_s - (f_s - (1.66666666666666657415e-01)::float8))) + (f_p - (f_s - (1.66666666666666657415e-01)::float8));
    f_w := (f_tl - ((f_tl + f_e) - ((f_tl + f_e) - f_tl))) + (f_e - ((f_tl + f_e) - f_tl));
    p := f_s + (f_tl + f_e);
    if f_w <> 0 and ((f_s - (p - (p - f_s))) + ((f_tl + f_e) - (p - f_s))) <> 0 and (p + 2 * ((f_s - (p - (p - f_s))) + ((f_tl + f_e) - (p - f_s)))) - p = 2 * ((f_s - (p - (p - f_s))) + ((f_tl + f_e) - (p - f_s))) and (f_w < 0) = (((f_s - (p - (p - f_s))) + ((f_tl + f_e) - (p - f_s))) < 0) then p := p + 2 * ((f_s - (p - (p - f_s))) + ((f_tl + f_e) - (p - f_s))); end if;
  elsif z = 0 or p = 0 then
    p := z * p + (1.66666666666666657415e-01)::float8;
  else
    p := fdlibm_fma_wide(a => z, b => p, c => (1.66666666666666657415e-01)::float8);
  end if;
  p := z * p;
  if abs(z) >= 1e-144 and abs(z) <= 1e144 and abs((7.70381505559019352791e-02)::float8) >= 1e-144 and abs((7.70381505559019352791e-02)::float8) <= 1e144 and abs((-6.88283971605453293030e-01)::float8) <= 1e288 then
    f_p := z * (7.70381505559019352791e-02)::float8;
    f_ah := (z * 134217729 - (z * 134217729 - z));
    f_e := (z - f_ah) * ((7.70381505559019352791e-02)::float8 - ((7.70381505559019352791e-02)::float8 * 134217729 - ((7.70381505559019352791e-02)::float8 * 134217729 - (7.70381505559019352791e-02)::float8))) - (((f_p - f_ah * ((7.70381505559019352791e-02)::float8 * 134217729 - ((7.70381505559019352791e-02)::float8 * 134217729 - (7.70381505559019352791e-02)::float8))) - (z - f_ah) * ((7.70381505559019352791e-02)::float8 * 134217729 - ((7.70381505559019352791e-02)::float8 * 134217729 - (7.70381505559019352791e-02)::float8))) - f_ah * ((7.70381505559019352791e-02)::float8 - ((7.70381505559019352791e-02)::float8 * 134217729 - ((7.70381505559019352791e-02)::float8 * 134217729 - (7.70381505559019352791e-02)::float8))));
    f_s := (-6.88283971605453293030e-01)::float8 + f_p;
    f_tl := ((-6.88283971605453293030e-01)::float8 - (f_s - (f_s - (-6.88283971605453293030e-01)::float8))) + (f_p - (f_s - (-6.88283971605453293030e-01)::float8));
    f_w := (f_tl - ((f_tl + f_e) - ((f_tl + f_e) - f_tl))) + (f_e - ((f_tl + f_e) - f_tl));
    q := f_s + (f_tl + f_e);
    if f_w <> 0 and ((f_s - (q - (q - f_s))) + ((f_tl + f_e) - (q - f_s))) <> 0 and (q + 2 * ((f_s - (q - (q - f_s))) + ((f_tl + f_e) - (q - f_s)))) - q = 2 * ((f_s - (q - (q - f_s))) + ((f_tl + f_e) - (q - f_s))) and (f_w < 0) = (((f_s - (q - (q - f_s))) + ((f_tl + f_e) - (q - f_s))) < 0) then q := q + 2 * ((f_s - (q - (q - f_s))) + ((f_tl + f_e) - (q - f_s))); end if;
  elsif z = 0 or (7.70381505559019352791e-02)::float8 = 0 then
    q := z * (7.70381505559019352791e-02)::float8 + (-6.88283971605453293030e-01)::float8;
  else
    q := fdlibm_fma_wide(a => z, b => (7.70381505559019352791e-02)::float8, c => (-6.88283971605453293030e-01)::float8);
  end if;
  if abs(z) >= 1e-144 and abs(z) <= 1e144 and abs(q) >= 1e-144 and abs(q) <= 1e144 and abs((2.02094576023350569471e+00)::float8) <= 1e288 then
    f_p := z * q;
    f_ah := (z * 134217729 - (z * 134217729 - z));
    f_bh := (q * 134217729 - (q * 134217729 - q));
    f_e := (z - f_ah) * (q - f_bh) - (((f_p - f_ah * f_bh) - (z - f_ah) * f_bh) - f_ah * (q - f_bh));
    f_s := (2.02094576023350569471e+00)::float8 + f_p;
    f_tl := ((2.02094576023350569471e+00)::float8 - (f_s - (f_s - (2.02094576023350569471e+00)::float8))) + (f_p - (f_s - (2.02094576023350569471e+00)::float8));
    f_w := (f_tl - ((f_tl + f_e) - ((f_tl + f_e) - f_tl))) + (f_e - ((f_tl + f_e) - f_tl));
    q := f_s + (f_tl + f_e);
    if f_w <> 0 and ((f_s - (q - (q - f_s))) + ((f_tl + f_e) - (q - f_s))) <> 0 and (q + 2 * ((f_s - (q - (q - f_s))) + ((f_tl + f_e) - (q - f_s)))) - q = 2 * ((f_s - (q - (q - f_s))) + ((f_tl + f_e) - (q - f_s))) and (f_w < 0) = (((f_s - (q - (q - f_s))) + ((f_tl + f_e) - (q - f_s))) < 0) then q := q + 2 * ((f_s - (q - (q - f_s))) + ((f_tl + f_e) - (q - f_s))); end if;
  elsif z = 0 or q = 0 then
    q := z * q + (2.02094576023350569471e+00)::float8;
  else
    q := fdlibm_fma_wide(a => z, b => q, c => (2.02094576023350569471e+00)::float8);
  end if;
  if abs(z) >= 1e-144 and abs(z) <= 1e144 and abs(q) >= 1e-144 and abs(q) <= 1e144 and abs((-2.40339491173441421878e+00)::float8) <= 1e288 then
    f_p := z * q;
    f_ah := (z * 134217729 - (z * 134217729 - z));
    f_bh := (q * 134217729 - (q * 134217729 - q));
    f_e := (z - f_ah) * (q - f_bh) - (((f_p - f_ah * f_bh) - (z - f_ah) * f_bh) - f_ah * (q - f_bh));
    f_s := (-2.40339491173441421878e+00)::float8 + f_p;
    f_tl := ((-2.40339491173441421878e+00)::float8 - (f_s - (f_s - (-2.40339491173441421878e+00)::float8))) + (f_p - (f_s - (-2.40339491173441421878e+00)::float8));
    f_w := (f_tl - ((f_tl + f_e) - ((f_tl + f_e) - f_tl))) + (f_e - ((f_tl + f_e) - f_tl));
    q := f_s + (f_tl + f_e);
    if f_w <> 0 and ((f_s - (q - (q - f_s))) + ((f_tl + f_e) - (q - f_s))) <> 0 and (q + 2 * ((f_s - (q - (q - f_s))) + ((f_tl + f_e) - (q - f_s)))) - q = 2 * ((f_s - (q - (q - f_s))) + ((f_tl + f_e) - (q - f_s))) and (f_w < 0) = (((f_s - (q - (q - f_s))) + ((f_tl + f_e) - (q - f_s))) < 0) then q := q + 2 * ((f_s - (q - (q - f_s))) + ((f_tl + f_e) - (q - f_s))); end if;
  elsif z = 0 or q = 0 then
    q := z * q + (-2.40339491173441421878e+00)::float8;
  else
    q := fdlibm_fma_wide(a => z, b => q, c => (-2.40339491173441421878e+00)::float8);
  end if;
  if abs(z) >= 1e-144 and abs(z) <= 1e144 and abs(q) >= 1e-144 and abs(q) <= 1e144 and abs((1)::float8) <= 1e288 then
    f_p := z * q;
    f_ah := (z * 134217729 - (z * 134217729 - z));
    f_bh := (q * 134217729 - (q * 134217729 - q));
    f_e := (z - f_ah) * (q - f_bh) - (((f_p - f_ah * f_bh) - (z - f_ah) * f_bh) - f_ah * (q - f_bh));
    f_s := (1)::float8 + f_p;
    f_tl := ((1)::float8 - (f_s - (f_s - (1)::float8))) + (f_p - (f_s - (1)::float8));
    f_w := (f_tl - ((f_tl + f_e) - ((f_tl + f_e) - f_tl))) + (f_e - ((f_tl + f_e) - f_tl));
    q := f_s + (f_tl + f_e);
    if f_w <> 0 and ((f_s - (q - (q - f_s))) + ((f_tl + f_e) - (q - f_s))) <> 0 and (q + 2 * ((f_s - (q - (q - f_s))) + ((f_tl + f_e) - (q - f_s)))) - q = 2 * ((f_s - (q - (q - f_s))) + ((f_tl + f_e) - (q - f_s))) and (f_w < 0) = (((f_s - (q - (q - f_s))) + ((f_tl + f_e) - (q - f_s))) < 0) then q := q + 2 * ((f_s - (q - (q - f_s))) + ((f_tl + f_e) - (q - f_s))); end if;
  elsif z = 0 or q = 0 then
    q := z * q + (1)::float8;
  else
    q := fdlibm_fma_wide(a => z, b => q, c => (1)::float8);
  end if;

  r := p / q;
  if ix < 0x3FE00000 then
    if abs(-x) >= 1e-144 and abs(-x) <= 1e144 and abs(r) >= 1e-144 and abs(r) <= 1e144 and abs((6.12323399573676603587e-17)::float8) <= 1e288 then
      f_p := -x * r;
      f_ah := (-x * 134217729 - (-x * 134217729 - -x));
      f_bh := (r * 134217729 - (r * 134217729 - r));
      f_e := (-x - f_ah) * (r - f_bh) - (((f_p - f_ah * f_bh) - (-x - f_ah) * f_bh) - f_ah * (r - f_bh));
      f_s := (6.12323399573676603587e-17)::float8 + f_p;
      f_tl := ((6.12323399573676603587e-17)::float8 - (f_s - (f_s - (6.12323399573676603587e-17)::float8))) + (f_p - (f_s - (6.12323399573676603587e-17)::float8));
      f_w := (f_tl - ((f_tl + f_e) - ((f_tl + f_e) - f_tl))) + (f_e - ((f_tl + f_e) - f_tl));
      u := f_s + (f_tl + f_e);
      if f_w <> 0 and ((f_s - (u - (u - f_s))) + ((f_tl + f_e) - (u - f_s))) <> 0 and (u + 2 * ((f_s - (u - (u - f_s))) + ((f_tl + f_e) - (u - f_s)))) - u = 2 * ((f_s - (u - (u - f_s))) + ((f_tl + f_e) - (u - f_s))) and (f_w < 0) = (((f_s - (u - (u - f_s))) + ((f_tl + f_e) - (u - f_s))) < 0) then u := u + 2 * ((f_s - (u - (u - f_s))) + ((f_tl + f_e) - (u - f_s))); end if;
    elsif -x = 0 or r = 0 then
      u := -x * r + (6.12323399573676603587e-17)::float8;
    else
      u := fdlibm_fma_wide(a => -x, b => r, c => (6.12323399573676603587e-17)::float8);
    end if;
    return 1.57079632679489655800e+00 - (x - u);
  end if;
  s := sqrt(z);
  if hx < 0 then
    if abs(r) >= 1e-144 and abs(r) <= 1e144 and abs(s) >= 1e-144 and abs(s) <= 1e144 and abs((-6.12323399573676603587e-17)::float8) <= 1e288 then
      f_p := r * s;
      f_ah := (r * 134217729 - (r * 134217729 - r));
      f_bh := (s * 134217729 - (s * 134217729 - s));
      f_e := (r - f_ah) * (s - f_bh) - (((f_p - f_ah * f_bh) - (r - f_ah) * f_bh) - f_ah * (s - f_bh));
      f_s := (-6.12323399573676603587e-17)::float8 + f_p;
      f_tl := ((-6.12323399573676603587e-17)::float8 - (f_s - (f_s - (-6.12323399573676603587e-17)::float8))) + (f_p - (f_s - (-6.12323399573676603587e-17)::float8));
      f_w := (f_tl - ((f_tl + f_e) - ((f_tl + f_e) - f_tl))) + (f_e - ((f_tl + f_e) - f_tl));
      w := f_s + (f_tl + f_e);
      if f_w <> 0 and ((f_s - (w - (w - f_s))) + ((f_tl + f_e) - (w - f_s))) <> 0 and (w + 2 * ((f_s - (w - (w - f_s))) + ((f_tl + f_e) - (w - f_s)))) - w = 2 * ((f_s - (w - (w - f_s))) + ((f_tl + f_e) - (w - f_s))) and (f_w < 0) = (((f_s - (w - (w - f_s))) + ((f_tl + f_e) - (w - f_s))) < 0) then w := w + 2 * ((f_s - (w - (w - f_s))) + ((f_tl + f_e) - (w - f_s))); end if;
    elsif r = 0 or s = 0 then
      w := r * s + (-6.12323399573676603587e-17)::float8;
    else
      w := fdlibm_fma_wide(a => r, b => s, c => (-6.12323399573676603587e-17)::float8);
    end if;
    return 3.14159265358979311600e+00 - 2 * (s + w);
  end if;
  df := (trunc((s) * (('{2.2250738585072014e-308,4.1045368012983762e-289,7.571533991467358e-270,1.3967014978599092e-250,2.5764595078388533e-231,4.7527289157379e-212,8.767237396033612e-193,1.617269844780878e-173,2.983336292480083e-154,5.503284107318959e-135,1.0151767349262597e-115,1.8726705418768793e-96,3.454467422037778e-77,6.372367644529809e-58,1.1754943508222875e-38,2.168404344971009e-19,4,73786976294838210000,1.361129467683754e+39,2.5108406941546723e+58,4.631683569492648e+77,8.54394814368364e+96,1.5760802478557792e+116,2.9073548971824276e+135,5.363123171977039e+154,9.893216058924181e+173,1.824976247048878e+193,3.366486976990959e+212,6.210072369202836e+231,1.1455561567389984e+251,2.113178124542661e+270,3.89812560456e+289}'::float8[])[(((1043 - ((((int8(float8send(s)) >> 32)::int) >> 20) & 2047)) + 1022) >> 6) + 1] * ('{1,2,4,8,16,32,64,128,256,512,1024,2048,4096,8192,16384,32768,65536,131072,262144,524288,1048576,2097152,4194304,8388608,16777216,33554432,67108864,134217728,268435456,536870912,1073741824,2147483648,4294967296,8589934592,17179869184,34359738368,68719476736,137438953472,274877906944,549755813888,1099511627776,2199023255552,4398046511104,8796093022208,17592186044416,35184372088832,70368744177664,140737488355328,281474976710656,562949953421312,1125899906842624,2251799813685248,4503599627370496,9007199254740992,18014398509481984,36028797018963970,72057594037927940,144115188075855870,288230376151711740,576460752303423500,1152921504606847000,2305843009213694000,4611686018427388000,9223372036854776000}'::float8[])[(((1043 - ((((int8(float8send(s)) >> 32)::int) >> 20) & 2047)) + 1022) & 63) + 1])) * (('{2.2250738585072014e-308,4.1045368012983762e-289,7.571533991467358e-270,1.3967014978599092e-250,2.5764595078388533e-231,4.7527289157379e-212,8.767237396033612e-193,1.617269844780878e-173,2.983336292480083e-154,5.503284107318959e-135,1.0151767349262597e-115,1.8726705418768793e-96,3.454467422037778e-77,6.372367644529809e-58,1.1754943508222875e-38,2.168404344971009e-19,4,73786976294838210000,1.361129467683754e+39,2.5108406941546723e+58,4.631683569492648e+77,8.54394814368364e+96,1.5760802478557792e+116,2.9073548971824276e+135,5.363123171977039e+154,9.893216058924181e+173,1.824976247048878e+193,3.366486976990959e+212,6.210072369202836e+231,1.1455561567389984e+251,2.113178124542661e+270,3.89812560456e+289}'::float8[])[(((((((int8(float8send(s)) >> 32)::int) >> 20) & 2047) - 1043) + 1022) >> 6) + 1] * ('{1,2,4,8,16,32,64,128,256,512,1024,2048,4096,8192,16384,32768,65536,131072,262144,524288,1048576,2097152,4194304,8388608,16777216,33554432,67108864,134217728,268435456,536870912,1073741824,2147483648,4294967296,8589934592,17179869184,34359738368,68719476736,137438953472,274877906944,549755813888,1099511627776,2199023255552,4398046511104,8796093022208,17592186044416,35184372088832,70368744177664,140737488355328,281474976710656,562949953421312,1125899906842624,2251799813685248,4503599627370496,9007199254740992,18014398509481984,36028797018963970,72057594037927940,144115188075855870,288230376151711740,576460752303423500,1152921504606847000,2305843009213694000,4611686018427388000,9223372036854776000}'::float8[])[(((((((int8(float8send(s)) >> 32)::int) >> 20) & 2047) - 1043) + 1022) & 63) + 1]));
  if abs(-df) >= 1e-144 and abs(-df) <= 1e144 and abs(df) >= 1e-144 and abs(df) <= 1e144 and abs(z) <= 1e288 then
    f_p := -df * df;
    f_ah := (-df * 134217729 - (-df * 134217729 - -df));
    f_bh := (df * 134217729 - (df * 134217729 - df));
    f_e := (-df - f_ah) * (df - f_bh) - (((f_p - f_ah * f_bh) - (-df - f_ah) * f_bh) - f_ah * (df - f_bh));
    f_s := z + f_p;
    f_tl := (z - (f_s - (f_s - z))) + (f_p - (f_s - z));
    f_w := (f_tl - ((f_tl + f_e) - ((f_tl + f_e) - f_tl))) + (f_e - ((f_tl + f_e) - f_tl));
    u := f_s + (f_tl + f_e);
    if f_w <> 0 and ((f_s - (u - (u - f_s))) + ((f_tl + f_e) - (u - f_s))) <> 0 and (u + 2 * ((f_s - (u - (u - f_s))) + ((f_tl + f_e) - (u - f_s)))) - u = 2 * ((f_s - (u - (u - f_s))) + ((f_tl + f_e) - (u - f_s))) and (f_w < 0) = (((f_s - (u - (u - f_s))) + ((f_tl + f_e) - (u - f_s))) < 0) then u := u + 2 * ((f_s - (u - (u - f_s))) + ((f_tl + f_e) - (u - f_s))); end if;
  elsif -df = 0 or df = 0 then
    u := -df * df + z;
  else
    u := fdlibm_fma_wide(a => -df, b => df, c => z);
  end if;
  c := u / (s + df);
  if abs(r) >= 1e-144 and abs(r) <= 1e144 and abs(s) >= 1e-144 and abs(s) <= 1e144 and abs(c) <= 1e288 then
    f_p := r * s;
    f_ah := (r * 134217729 - (r * 134217729 - r));
    f_bh := (s * 134217729 - (s * 134217729 - s));
    f_e := (r - f_ah) * (s - f_bh) - (((f_p - f_ah * f_bh) - (r - f_ah) * f_bh) - f_ah * (s - f_bh));
    f_s := c + f_p;
    f_tl := (c - (f_s - (f_s - c))) + (f_p - (f_s - c));
    f_w := (f_tl - ((f_tl + f_e) - ((f_tl + f_e) - f_tl))) + (f_e - ((f_tl + f_e) - f_tl));
    w := f_s + (f_tl + f_e);
    if f_w <> 0 and ((f_s - (w - (w - f_s))) + ((f_tl + f_e) - (w - f_s))) <> 0 and (w + 2 * ((f_s - (w - (w - f_s))) + ((f_tl + f_e) - (w - f_s)))) - w = 2 * ((f_s - (w - (w - f_s))) + ((f_tl + f_e) - (w - f_s))) and (f_w < 0) = (((f_s - (w - (w - f_s))) + ((f_tl + f_e) - (w - f_s))) < 0) then w := w + 2 * ((f_s - (w - (w - f_s))) + ((f_tl + f_e) - (w - f_s))); end if;
  elsif r = 0 or s = 0 then
    w := r * s + c;
  else
    w := fdlibm_fma_wide(a => r, b => s, c => c);
  end if;
  return 2 * (df + w);
end $$;
-- V8's atan (ieee754.cc; Math.atan). 2 × x - 1 is exact on [7/16, 11/16).
create function p3.fdlibm_atan(x float8) returns float8 language plpgsql immutable as $$
declare f_a float8; f_b float8; f_c float8; f_p float8; f_ah float8; f_bh float8; f_e float8; f_s float8; f_tl float8; f_w float8; a_x float8; a_hx int; a_ix int; a_id int; a_w float8; a_s1 float8; a_s2 float8; a_z float8; a_u float8;
 res float8;
begin
  loop
    a_x := x;
    a_hx := (int8(float8send(a_x)) >> 32)::int;
    a_ix := a_hx & 2147483647;
    if a_ix >= 0x44100000 then
      if a_ix > 0x7FF00000 or (a_ix = 0x7FF00000 and (int8(float8send(a_x)) & 4294967295) <> 0) then res := a_x; exit; end if;
      if a_hx > 0 then res := 1.57079632679489655800e+00::float8 + 6.12323399573676603587e-17::float8; exit; end if;
      res := -1.57079632679489655800e+00::float8 - 6.12323399573676603587e-17::float8; exit;
    end if;
    if a_ix < 0x3FDC0000 then
      if a_ix < 0x3E400000 then res := a_x; exit; end if;
      a_id := -1;
    else
      a_x := abs(a_x);
      if a_ix < 0x3FF30000 then
        if a_ix < 0x3FE60000 then
          a_id := 0;
          a_x := (2 * a_x - 1) / (2 + a_x);
        else
          a_id := 1;
          a_x := (a_x - 1) / (a_x + 1);
        end if;
      elsif a_ix < 0x40038000 then
        a_id := 2;
        if abs((1.5)::float8) >= 1e-144 and abs((1.5)::float8) <= 1e144 and abs(a_x) >= 1e-144 and abs(a_x) <= 1e144 and abs((1)::float8) <= 1e288 then
          f_p := (1.5)::float8 * a_x;
          f_bh := (a_x * 134217729 - (a_x * 134217729 - a_x));
          f_e := ((1.5)::float8 - ((1.5)::float8 * 134217729 - ((1.5)::float8 * 134217729 - (1.5)::float8))) * (a_x - f_bh) - (((f_p - ((1.5)::float8 * 134217729 - ((1.5)::float8 * 134217729 - (1.5)::float8)) * f_bh) - ((1.5)::float8 - ((1.5)::float8 * 134217729 - ((1.5)::float8 * 134217729 - (1.5)::float8))) * f_bh) - ((1.5)::float8 * 134217729 - ((1.5)::float8 * 134217729 - (1.5)::float8)) * (a_x - f_bh));
          f_s := (1)::float8 + f_p;
          f_tl := ((1)::float8 - (f_s - (f_s - (1)::float8))) + (f_p - (f_s - (1)::float8));
          f_w := (f_tl - ((f_tl + f_e) - ((f_tl + f_e) - f_tl))) + (f_e - ((f_tl + f_e) - f_tl));
          a_u := f_s + (f_tl + f_e);
          if f_w <> 0 and ((f_s - (a_u - (a_u - f_s))) + ((f_tl + f_e) - (a_u - f_s))) <> 0 and (a_u + 2 * ((f_s - (a_u - (a_u - f_s))) + ((f_tl + f_e) - (a_u - f_s)))) - a_u = 2 * ((f_s - (a_u - (a_u - f_s))) + ((f_tl + f_e) - (a_u - f_s))) and (f_w < 0) = (((f_s - (a_u - (a_u - f_s))) + ((f_tl + f_e) - (a_u - f_s))) < 0) then a_u := a_u + 2 * ((f_s - (a_u - (a_u - f_s))) + ((f_tl + f_e) - (a_u - f_s))); end if;
        elsif (1.5)::float8 = 0 or a_x = 0 then
          a_u := (1.5)::float8 * a_x + (1)::float8;
        else
          a_u := fdlibm_fma_wide(a => (1.5)::float8, b => a_x, c => (1)::float8);
        end if;
        a_x := (a_x - 1.5) / a_u;
      else
        a_id := 3;
        a_x := -1 / a_x;
      end if;
    end if;
    a_z := a_x * a_x;
    a_w := a_z * a_z;
    if abs(a_w) >= 1e-144 and abs(a_w) <= 1e144 and abs((1.62858201153657823623e-02)::float8) >= 1e-144 and abs((1.62858201153657823623e-02)::float8) <= 1e144 and abs((4.97687799461593236017e-02)::float8) <= 1e288 then
      f_p := a_w * (1.62858201153657823623e-02)::float8;
      f_ah := (a_w * 134217729 - (a_w * 134217729 - a_w));
      f_e := (a_w - f_ah) * ((1.62858201153657823623e-02)::float8 - ((1.62858201153657823623e-02)::float8 * 134217729 - ((1.62858201153657823623e-02)::float8 * 134217729 - (1.62858201153657823623e-02)::float8))) - (((f_p - f_ah * ((1.62858201153657823623e-02)::float8 * 134217729 - ((1.62858201153657823623e-02)::float8 * 134217729 - (1.62858201153657823623e-02)::float8))) - (a_w - f_ah) * ((1.62858201153657823623e-02)::float8 * 134217729 - ((1.62858201153657823623e-02)::float8 * 134217729 - (1.62858201153657823623e-02)::float8))) - f_ah * ((1.62858201153657823623e-02)::float8 - ((1.62858201153657823623e-02)::float8 * 134217729 - ((1.62858201153657823623e-02)::float8 * 134217729 - (1.62858201153657823623e-02)::float8))));
      f_s := (4.97687799461593236017e-02)::float8 + f_p;
      f_tl := ((4.97687799461593236017e-02)::float8 - (f_s - (f_s - (4.97687799461593236017e-02)::float8))) + (f_p - (f_s - (4.97687799461593236017e-02)::float8));
      f_w := (f_tl - ((f_tl + f_e) - ((f_tl + f_e) - f_tl))) + (f_e - ((f_tl + f_e) - f_tl));
      a_s1 := f_s + (f_tl + f_e);
      if f_w <> 0 and ((f_s - (a_s1 - (a_s1 - f_s))) + ((f_tl + f_e) - (a_s1 - f_s))) <> 0 and (a_s1 + 2 * ((f_s - (a_s1 - (a_s1 - f_s))) + ((f_tl + f_e) - (a_s1 - f_s)))) - a_s1 = 2 * ((f_s - (a_s1 - (a_s1 - f_s))) + ((f_tl + f_e) - (a_s1 - f_s))) and (f_w < 0) = (((f_s - (a_s1 - (a_s1 - f_s))) + ((f_tl + f_e) - (a_s1 - f_s))) < 0) then a_s1 := a_s1 + 2 * ((f_s - (a_s1 - (a_s1 - f_s))) + ((f_tl + f_e) - (a_s1 - f_s))); end if;
    elsif a_w = 0 or (1.62858201153657823623e-02)::float8 = 0 then
      a_s1 := a_w * (1.62858201153657823623e-02)::float8 + (4.97687799461593236017e-02)::float8;
    else
      a_s1 := fdlibm_fma_wide(a => a_w, b => (1.62858201153657823623e-02)::float8, c => (4.97687799461593236017e-02)::float8);
    end if;
    if abs(a_w) >= 1e-144 and abs(a_w) <= 1e144 and abs(a_s1) >= 1e-144 and abs(a_s1) <= 1e144 and abs((6.66107313738753120669e-02)::float8) <= 1e288 then
      f_p := a_w * a_s1;
      f_ah := (a_w * 134217729 - (a_w * 134217729 - a_w));
      f_bh := (a_s1 * 134217729 - (a_s1 * 134217729 - a_s1));
      f_e := (a_w - f_ah) * (a_s1 - f_bh) - (((f_p - f_ah * f_bh) - (a_w - f_ah) * f_bh) - f_ah * (a_s1 - f_bh));
      f_s := (6.66107313738753120669e-02)::float8 + f_p;
      f_tl := ((6.66107313738753120669e-02)::float8 - (f_s - (f_s - (6.66107313738753120669e-02)::float8))) + (f_p - (f_s - (6.66107313738753120669e-02)::float8));
      f_w := (f_tl - ((f_tl + f_e) - ((f_tl + f_e) - f_tl))) + (f_e - ((f_tl + f_e) - f_tl));
      a_s1 := f_s + (f_tl + f_e);
      if f_w <> 0 and ((f_s - (a_s1 - (a_s1 - f_s))) + ((f_tl + f_e) - (a_s1 - f_s))) <> 0 and (a_s1 + 2 * ((f_s - (a_s1 - (a_s1 - f_s))) + ((f_tl + f_e) - (a_s1 - f_s)))) - a_s1 = 2 * ((f_s - (a_s1 - (a_s1 - f_s))) + ((f_tl + f_e) - (a_s1 - f_s))) and (f_w < 0) = (((f_s - (a_s1 - (a_s1 - f_s))) + ((f_tl + f_e) - (a_s1 - f_s))) < 0) then a_s1 := a_s1 + 2 * ((f_s - (a_s1 - (a_s1 - f_s))) + ((f_tl + f_e) - (a_s1 - f_s))); end if;
    elsif a_w = 0 or a_s1 = 0 then
      a_s1 := a_w * a_s1 + (6.66107313738753120669e-02)::float8;
    else
      a_s1 := fdlibm_fma_wide(a => a_w, b => a_s1, c => (6.66107313738753120669e-02)::float8);
    end if;
    if abs(a_w) >= 1e-144 and abs(a_w) <= 1e144 and abs(a_s1) >= 1e-144 and abs(a_s1) <= 1e144 and abs((9.09088713343650656196e-02)::float8) <= 1e288 then
      f_p := a_w * a_s1;
      f_ah := (a_w * 134217729 - (a_w * 134217729 - a_w));
      f_bh := (a_s1 * 134217729 - (a_s1 * 134217729 - a_s1));
      f_e := (a_w - f_ah) * (a_s1 - f_bh) - (((f_p - f_ah * f_bh) - (a_w - f_ah) * f_bh) - f_ah * (a_s1 - f_bh));
      f_s := (9.09088713343650656196e-02)::float8 + f_p;
      f_tl := ((9.09088713343650656196e-02)::float8 - (f_s - (f_s - (9.09088713343650656196e-02)::float8))) + (f_p - (f_s - (9.09088713343650656196e-02)::float8));
      f_w := (f_tl - ((f_tl + f_e) - ((f_tl + f_e) - f_tl))) + (f_e - ((f_tl + f_e) - f_tl));
      a_s1 := f_s + (f_tl + f_e);
      if f_w <> 0 and ((f_s - (a_s1 - (a_s1 - f_s))) + ((f_tl + f_e) - (a_s1 - f_s))) <> 0 and (a_s1 + 2 * ((f_s - (a_s1 - (a_s1 - f_s))) + ((f_tl + f_e) - (a_s1 - f_s)))) - a_s1 = 2 * ((f_s - (a_s1 - (a_s1 - f_s))) + ((f_tl + f_e) - (a_s1 - f_s))) and (f_w < 0) = (((f_s - (a_s1 - (a_s1 - f_s))) + ((f_tl + f_e) - (a_s1 - f_s))) < 0) then a_s1 := a_s1 + 2 * ((f_s - (a_s1 - (a_s1 - f_s))) + ((f_tl + f_e) - (a_s1 - f_s))); end if;
    elsif a_w = 0 or a_s1 = 0 then
      a_s1 := a_w * a_s1 + (9.09088713343650656196e-02)::float8;
    else
      a_s1 := fdlibm_fma_wide(a => a_w, b => a_s1, c => (9.09088713343650656196e-02)::float8);
    end if;
    if abs(a_w) >= 1e-144 and abs(a_w) <= 1e144 and abs(a_s1) >= 1e-144 and abs(a_s1) <= 1e144 and abs((1.42857142725034663711e-01)::float8) <= 1e288 then
      f_p := a_w * a_s1;
      f_ah := (a_w * 134217729 - (a_w * 134217729 - a_w));
      f_bh := (a_s1 * 134217729 - (a_s1 * 134217729 - a_s1));
      f_e := (a_w - f_ah) * (a_s1 - f_bh) - (((f_p - f_ah * f_bh) - (a_w - f_ah) * f_bh) - f_ah * (a_s1 - f_bh));
      f_s := (1.42857142725034663711e-01)::float8 + f_p;
      f_tl := ((1.42857142725034663711e-01)::float8 - (f_s - (f_s - (1.42857142725034663711e-01)::float8))) + (f_p - (f_s - (1.42857142725034663711e-01)::float8));
      f_w := (f_tl - ((f_tl + f_e) - ((f_tl + f_e) - f_tl))) + (f_e - ((f_tl + f_e) - f_tl));
      a_s1 := f_s + (f_tl + f_e);
      if f_w <> 0 and ((f_s - (a_s1 - (a_s1 - f_s))) + ((f_tl + f_e) - (a_s1 - f_s))) <> 0 and (a_s1 + 2 * ((f_s - (a_s1 - (a_s1 - f_s))) + ((f_tl + f_e) - (a_s1 - f_s)))) - a_s1 = 2 * ((f_s - (a_s1 - (a_s1 - f_s))) + ((f_tl + f_e) - (a_s1 - f_s))) and (f_w < 0) = (((f_s - (a_s1 - (a_s1 - f_s))) + ((f_tl + f_e) - (a_s1 - f_s))) < 0) then a_s1 := a_s1 + 2 * ((f_s - (a_s1 - (a_s1 - f_s))) + ((f_tl + f_e) - (a_s1 - f_s))); end if;
    elsif a_w = 0 or a_s1 = 0 then
      a_s1 := a_w * a_s1 + (1.42857142725034663711e-01)::float8;
    else
      a_s1 := fdlibm_fma_wide(a => a_w, b => a_s1, c => (1.42857142725034663711e-01)::float8);
    end if;
    if abs(a_w) >= 1e-144 and abs(a_w) <= 1e144 and abs(a_s1) >= 1e-144 and abs(a_s1) <= 1e144 and abs((3.33333333333329318027e-01)::float8) <= 1e288 then
      f_p := a_w * a_s1;
      f_ah := (a_w * 134217729 - (a_w * 134217729 - a_w));
      f_bh := (a_s1 * 134217729 - (a_s1 * 134217729 - a_s1));
      f_e := (a_w - f_ah) * (a_s1 - f_bh) - (((f_p - f_ah * f_bh) - (a_w - f_ah) * f_bh) - f_ah * (a_s1 - f_bh));
      f_s := (3.33333333333329318027e-01)::float8 + f_p;
      f_tl := ((3.33333333333329318027e-01)::float8 - (f_s - (f_s - (3.33333333333329318027e-01)::float8))) + (f_p - (f_s - (3.33333333333329318027e-01)::float8));
      f_w := (f_tl - ((f_tl + f_e) - ((f_tl + f_e) - f_tl))) + (f_e - ((f_tl + f_e) - f_tl));
      a_s1 := f_s + (f_tl + f_e);
      if f_w <> 0 and ((f_s - (a_s1 - (a_s1 - f_s))) + ((f_tl + f_e) - (a_s1 - f_s))) <> 0 and (a_s1 + 2 * ((f_s - (a_s1 - (a_s1 - f_s))) + ((f_tl + f_e) - (a_s1 - f_s)))) - a_s1 = 2 * ((f_s - (a_s1 - (a_s1 - f_s))) + ((f_tl + f_e) - (a_s1 - f_s))) and (f_w < 0) = (((f_s - (a_s1 - (a_s1 - f_s))) + ((f_tl + f_e) - (a_s1 - f_s))) < 0) then a_s1 := a_s1 + 2 * ((f_s - (a_s1 - (a_s1 - f_s))) + ((f_tl + f_e) - (a_s1 - f_s))); end if;
    elsif a_w = 0 or a_s1 = 0 then
      a_s1 := a_w * a_s1 + (3.33333333333329318027e-01)::float8;
    else
      a_s1 := fdlibm_fma_wide(a => a_w, b => a_s1, c => (3.33333333333329318027e-01)::float8);
    end if;
    a_s1 := a_z * a_s1;
    if abs(a_w) >= 1e-144 and abs(a_w) <= 1e144 and abs((-3.65315727442169155270e-02)::float8) >= 1e-144 and abs((-3.65315727442169155270e-02)::float8) <= 1e144 and abs((-5.83357013379057348645e-02)::float8) <= 1e288 then
      f_p := a_w * (-3.65315727442169155270e-02)::float8;
      f_ah := (a_w * 134217729 - (a_w * 134217729 - a_w));
      f_e := (a_w - f_ah) * ((-3.65315727442169155270e-02)::float8 - ((-3.65315727442169155270e-02)::float8 * 134217729 - ((-3.65315727442169155270e-02)::float8 * 134217729 - (-3.65315727442169155270e-02)::float8))) - (((f_p - f_ah * ((-3.65315727442169155270e-02)::float8 * 134217729 - ((-3.65315727442169155270e-02)::float8 * 134217729 - (-3.65315727442169155270e-02)::float8))) - (a_w - f_ah) * ((-3.65315727442169155270e-02)::float8 * 134217729 - ((-3.65315727442169155270e-02)::float8 * 134217729 - (-3.65315727442169155270e-02)::float8))) - f_ah * ((-3.65315727442169155270e-02)::float8 - ((-3.65315727442169155270e-02)::float8 * 134217729 - ((-3.65315727442169155270e-02)::float8 * 134217729 - (-3.65315727442169155270e-02)::float8))));
      f_s := (-5.83357013379057348645e-02)::float8 + f_p;
      f_tl := ((-5.83357013379057348645e-02)::float8 - (f_s - (f_s - (-5.83357013379057348645e-02)::float8))) + (f_p - (f_s - (-5.83357013379057348645e-02)::float8));
      f_w := (f_tl - ((f_tl + f_e) - ((f_tl + f_e) - f_tl))) + (f_e - ((f_tl + f_e) - f_tl));
      a_s2 := f_s + (f_tl + f_e);
      if f_w <> 0 and ((f_s - (a_s2 - (a_s2 - f_s))) + ((f_tl + f_e) - (a_s2 - f_s))) <> 0 and (a_s2 + 2 * ((f_s - (a_s2 - (a_s2 - f_s))) + ((f_tl + f_e) - (a_s2 - f_s)))) - a_s2 = 2 * ((f_s - (a_s2 - (a_s2 - f_s))) + ((f_tl + f_e) - (a_s2 - f_s))) and (f_w < 0) = (((f_s - (a_s2 - (a_s2 - f_s))) + ((f_tl + f_e) - (a_s2 - f_s))) < 0) then a_s2 := a_s2 + 2 * ((f_s - (a_s2 - (a_s2 - f_s))) + ((f_tl + f_e) - (a_s2 - f_s))); end if;
    elsif a_w = 0 or (-3.65315727442169155270e-02)::float8 = 0 then
      a_s2 := a_w * (-3.65315727442169155270e-02)::float8 + (-5.83357013379057348645e-02)::float8;
    else
      a_s2 := fdlibm_fma_wide(a => a_w, b => (-3.65315727442169155270e-02)::float8, c => (-5.83357013379057348645e-02)::float8);
    end if;
    if abs(a_w) >= 1e-144 and abs(a_w) <= 1e144 and abs(a_s2) >= 1e-144 and abs(a_s2) <= 1e144 and abs((-7.69187620504482999495e-02)::float8) <= 1e288 then
      f_p := a_w * a_s2;
      f_ah := (a_w * 134217729 - (a_w * 134217729 - a_w));
      f_bh := (a_s2 * 134217729 - (a_s2 * 134217729 - a_s2));
      f_e := (a_w - f_ah) * (a_s2 - f_bh) - (((f_p - f_ah * f_bh) - (a_w - f_ah) * f_bh) - f_ah * (a_s2 - f_bh));
      f_s := (-7.69187620504482999495e-02)::float8 + f_p;
      f_tl := ((-7.69187620504482999495e-02)::float8 - (f_s - (f_s - (-7.69187620504482999495e-02)::float8))) + (f_p - (f_s - (-7.69187620504482999495e-02)::float8));
      f_w := (f_tl - ((f_tl + f_e) - ((f_tl + f_e) - f_tl))) + (f_e - ((f_tl + f_e) - f_tl));
      a_s2 := f_s + (f_tl + f_e);
      if f_w <> 0 and ((f_s - (a_s2 - (a_s2 - f_s))) + ((f_tl + f_e) - (a_s2 - f_s))) <> 0 and (a_s2 + 2 * ((f_s - (a_s2 - (a_s2 - f_s))) + ((f_tl + f_e) - (a_s2 - f_s)))) - a_s2 = 2 * ((f_s - (a_s2 - (a_s2 - f_s))) + ((f_tl + f_e) - (a_s2 - f_s))) and (f_w < 0) = (((f_s - (a_s2 - (a_s2 - f_s))) + ((f_tl + f_e) - (a_s2 - f_s))) < 0) then a_s2 := a_s2 + 2 * ((f_s - (a_s2 - (a_s2 - f_s))) + ((f_tl + f_e) - (a_s2 - f_s))); end if;
    elsif a_w = 0 or a_s2 = 0 then
      a_s2 := a_w * a_s2 + (-7.69187620504482999495e-02)::float8;
    else
      a_s2 := fdlibm_fma_wide(a => a_w, b => a_s2, c => (-7.69187620504482999495e-02)::float8);
    end if;
    if abs(a_w) >= 1e-144 and abs(a_w) <= 1e144 and abs(a_s2) >= 1e-144 and abs(a_s2) <= 1e144 and abs((-1.11111104054623557880e-01)::float8) <= 1e288 then
      f_p := a_w * a_s2;
      f_ah := (a_w * 134217729 - (a_w * 134217729 - a_w));
      f_bh := (a_s2 * 134217729 - (a_s2 * 134217729 - a_s2));
      f_e := (a_w - f_ah) * (a_s2 - f_bh) - (((f_p - f_ah * f_bh) - (a_w - f_ah) * f_bh) - f_ah * (a_s2 - f_bh));
      f_s := (-1.11111104054623557880e-01)::float8 + f_p;
      f_tl := ((-1.11111104054623557880e-01)::float8 - (f_s - (f_s - (-1.11111104054623557880e-01)::float8))) + (f_p - (f_s - (-1.11111104054623557880e-01)::float8));
      f_w := (f_tl - ((f_tl + f_e) - ((f_tl + f_e) - f_tl))) + (f_e - ((f_tl + f_e) - f_tl));
      a_s2 := f_s + (f_tl + f_e);
      if f_w <> 0 and ((f_s - (a_s2 - (a_s2 - f_s))) + ((f_tl + f_e) - (a_s2 - f_s))) <> 0 and (a_s2 + 2 * ((f_s - (a_s2 - (a_s2 - f_s))) + ((f_tl + f_e) - (a_s2 - f_s)))) - a_s2 = 2 * ((f_s - (a_s2 - (a_s2 - f_s))) + ((f_tl + f_e) - (a_s2 - f_s))) and (f_w < 0) = (((f_s - (a_s2 - (a_s2 - f_s))) + ((f_tl + f_e) - (a_s2 - f_s))) < 0) then a_s2 := a_s2 + 2 * ((f_s - (a_s2 - (a_s2 - f_s))) + ((f_tl + f_e) - (a_s2 - f_s))); end if;
    elsif a_w = 0 or a_s2 = 0 then
      a_s2 := a_w * a_s2 + (-1.11111104054623557880e-01)::float8;
    else
      a_s2 := fdlibm_fma_wide(a => a_w, b => a_s2, c => (-1.11111104054623557880e-01)::float8);
    end if;
    if abs(a_w) >= 1e-144 and abs(a_w) <= 1e144 and abs(a_s2) >= 1e-144 and abs(a_s2) <= 1e144 and abs((-1.99999999998764832476e-01)::float8) <= 1e288 then
      f_p := a_w * a_s2;
      f_ah := (a_w * 134217729 - (a_w * 134217729 - a_w));
      f_bh := (a_s2 * 134217729 - (a_s2 * 134217729 - a_s2));
      f_e := (a_w - f_ah) * (a_s2 - f_bh) - (((f_p - f_ah * f_bh) - (a_w - f_ah) * f_bh) - f_ah * (a_s2 - f_bh));
      f_s := (-1.99999999998764832476e-01)::float8 + f_p;
      f_tl := ((-1.99999999998764832476e-01)::float8 - (f_s - (f_s - (-1.99999999998764832476e-01)::float8))) + (f_p - (f_s - (-1.99999999998764832476e-01)::float8));
      f_w := (f_tl - ((f_tl + f_e) - ((f_tl + f_e) - f_tl))) + (f_e - ((f_tl + f_e) - f_tl));
      a_s2 := f_s + (f_tl + f_e);
      if f_w <> 0 and ((f_s - (a_s2 - (a_s2 - f_s))) + ((f_tl + f_e) - (a_s2 - f_s))) <> 0 and (a_s2 + 2 * ((f_s - (a_s2 - (a_s2 - f_s))) + ((f_tl + f_e) - (a_s2 - f_s)))) - a_s2 = 2 * ((f_s - (a_s2 - (a_s2 - f_s))) + ((f_tl + f_e) - (a_s2 - f_s))) and (f_w < 0) = (((f_s - (a_s2 - (a_s2 - f_s))) + ((f_tl + f_e) - (a_s2 - f_s))) < 0) then a_s2 := a_s2 + 2 * ((f_s - (a_s2 - (a_s2 - f_s))) + ((f_tl + f_e) - (a_s2 - f_s))); end if;
    elsif a_w = 0 or a_s2 = 0 then
      a_s2 := a_w * a_s2 + (-1.99999999998764832476e-01)::float8;
    else
      a_s2 := fdlibm_fma_wide(a => a_w, b => a_s2, c => (-1.99999999998764832476e-01)::float8);
    end if;
    a_s2 := a_w * a_s2;
    if a_id < 0 then
      f_b := a_s1 + a_s2;
      if abs(-a_x) >= 1e-144 and abs(-a_x) <= 1e144 and abs(f_b) >= 1e-144 and abs(f_b) <= 1e144 and abs(a_x) <= 1e288 then
        f_p := -a_x * f_b;
        f_ah := (-a_x * 134217729 - (-a_x * 134217729 - -a_x));
        f_bh := (f_b * 134217729 - (f_b * 134217729 - f_b));
        f_e := (-a_x - f_ah) * (f_b - f_bh) - (((f_p - f_ah * f_bh) - (-a_x - f_ah) * f_bh) - f_ah * (f_b - f_bh));
        f_s := a_x + f_p;
        f_tl := (a_x - (f_s - (f_s - a_x))) + (f_p - (f_s - a_x));
        f_w := (f_tl - ((f_tl + f_e) - ((f_tl + f_e) - f_tl))) + (f_e - ((f_tl + f_e) - f_tl));
        a_u := f_s + (f_tl + f_e);
        if f_w <> 0 and ((f_s - (a_u - (a_u - f_s))) + ((f_tl + f_e) - (a_u - f_s))) <> 0 and (a_u + 2 * ((f_s - (a_u - (a_u - f_s))) + ((f_tl + f_e) - (a_u - f_s)))) - a_u = 2 * ((f_s - (a_u - (a_u - f_s))) + ((f_tl + f_e) - (a_u - f_s))) and (f_w < 0) = (((f_s - (a_u - (a_u - f_s))) + ((f_tl + f_e) - (a_u - f_s))) < 0) then a_u := a_u + 2 * ((f_s - (a_u - (a_u - f_s))) + ((f_tl + f_e) - (a_u - f_s))); end if;
      elsif -a_x = 0 or f_b = 0 then
        a_u := -a_x * f_b + a_x;
      else
        a_u := fdlibm_fma_wide(a => -a_x, b => f_b, c => a_x);
      end if;
      res := a_u; exit;
    end if;
    f_b := a_s1 + a_s2;
    f_c := -case a_id when 0 then 2.26987774529616870924e-17 when 1 then 3.06161699786838301793e-17 when 2 then 1.39033110312309984516e-17 else 6.12323399573676603587e-17 end;
    if abs(a_x) >= 1e-144 and abs(a_x) <= 1e144 and abs(f_b) >= 1e-144 and abs(f_b) <= 1e144 and abs(f_c) <= 1e288 then
      f_p := a_x * f_b;
      f_ah := (a_x * 134217729 - (a_x * 134217729 - a_x));
      f_bh := (f_b * 134217729 - (f_b * 134217729 - f_b));
      f_e := (a_x - f_ah) * (f_b - f_bh) - (((f_p - f_ah * f_bh) - (a_x - f_ah) * f_bh) - f_ah * (f_b - f_bh));
      f_s := f_c + f_p;
      f_tl := (f_c - (f_s - (f_s - f_c))) + (f_p - (f_s - f_c));
      f_w := (f_tl - ((f_tl + f_e) - ((f_tl + f_e) - f_tl))) + (f_e - ((f_tl + f_e) - f_tl));
      a_u := f_s + (f_tl + f_e);
      if f_w <> 0 and ((f_s - (a_u - (a_u - f_s))) + ((f_tl + f_e) - (a_u - f_s))) <> 0 and (a_u + 2 * ((f_s - (a_u - (a_u - f_s))) + ((f_tl + f_e) - (a_u - f_s)))) - a_u = 2 * ((f_s - (a_u - (a_u - f_s))) + ((f_tl + f_e) - (a_u - f_s))) and (f_w < 0) = (((f_s - (a_u - (a_u - f_s))) + ((f_tl + f_e) - (a_u - f_s))) < 0) then a_u := a_u + 2 * ((f_s - (a_u - (a_u - f_s))) + ((f_tl + f_e) - (a_u - f_s))); end if;
    elsif a_x = 0 or f_b = 0 then
      a_u := a_x * f_b + f_c;
    else
      a_u := fdlibm_fma_wide(a => a_x, b => f_b, c => f_c);
    end if;
    a_z := case a_id when 0 then 4.63647609000806093515e-01 when 1 then 7.85398163397448278999e-01
      when 2 then 9.82793723247329054082e-01 else 1.57079632679489655800e+00 end - (a_u - a_x);
    res := case when a_hx < 0 then -a_z else a_z end; exit;
  end loop;

  return res;
end $$;
-- V8's atan2 (ieee754.cc; Math.atan2(y, x)). y / x that underflows is the zero or subnormal IEEE gives.
create function p3.fdlibm_atan2(x float8, y float8) returns float8 language plpgsql immutable as $$
declare f_a float8; f_b float8; f_c float8; f_p float8; f_ah float8; f_bh float8; f_e float8; f_s float8; f_tl float8; f_w float8; a_x float8; a_hx int; a_ix int; a_id int; a_w float8; a_s1 float8; a_s2 float8; a_z float8; a_u float8;
 hx int := (int8(float8send(x)) >> 32)::int; ix int := hx & 2147483647; lx bigint := (int8(float8send(x)) & 4294967295); hy int := (int8(float8send(y)) >> 32)::int; iy int := hy & 2147483647; ly bigint := (int8(float8send(y)) & 4294967295); m int; k int; z float8;
begin
  if x = 'NaN' or y = 'NaN' then return x + y; end if;
  if hx = 0x3FF00000 and lx = 0 then
  loop
    a_x := y;
    a_hx := (int8(float8send(a_x)) >> 32)::int;
    a_ix := a_hx & 2147483647;
    if a_ix >= 0x44100000 then
      if a_ix > 0x7FF00000 or (a_ix = 0x7FF00000 and (int8(float8send(a_x)) & 4294967295) <> 0) then z := a_x; exit; end if;
      if a_hx > 0 then z := 1.57079632679489655800e+00::float8 + 6.12323399573676603587e-17::float8; exit; end if;
      z := -1.57079632679489655800e+00::float8 - 6.12323399573676603587e-17::float8; exit;
    end if;
    if a_ix < 0x3FDC0000 then
      if a_ix < 0x3E400000 then z := a_x; exit; end if;
      a_id := -1;
    else
      a_x := abs(a_x);
      if a_ix < 0x3FF30000 then
        if a_ix < 0x3FE60000 then
          a_id := 0;
          a_x := (2 * a_x - 1) / (2 + a_x);
        else
          a_id := 1;
          a_x := (a_x - 1) / (a_x + 1);
        end if;
      elsif a_ix < 0x40038000 then
        a_id := 2;
        if abs((1.5)::float8) >= 1e-144 and abs((1.5)::float8) <= 1e144 and abs(a_x) >= 1e-144 and abs(a_x) <= 1e144 and abs((1)::float8) <= 1e288 then
          f_p := (1.5)::float8 * a_x;
          f_bh := (a_x * 134217729 - (a_x * 134217729 - a_x));
          f_e := ((1.5)::float8 - ((1.5)::float8 * 134217729 - ((1.5)::float8 * 134217729 - (1.5)::float8))) * (a_x - f_bh) - (((f_p - ((1.5)::float8 * 134217729 - ((1.5)::float8 * 134217729 - (1.5)::float8)) * f_bh) - ((1.5)::float8 - ((1.5)::float8 * 134217729 - ((1.5)::float8 * 134217729 - (1.5)::float8))) * f_bh) - ((1.5)::float8 * 134217729 - ((1.5)::float8 * 134217729 - (1.5)::float8)) * (a_x - f_bh));
          f_s := (1)::float8 + f_p;
          f_tl := ((1)::float8 - (f_s - (f_s - (1)::float8))) + (f_p - (f_s - (1)::float8));
          f_w := (f_tl - ((f_tl + f_e) - ((f_tl + f_e) - f_tl))) + (f_e - ((f_tl + f_e) - f_tl));
          a_u := f_s + (f_tl + f_e);
          if f_w <> 0 and ((f_s - (a_u - (a_u - f_s))) + ((f_tl + f_e) - (a_u - f_s))) <> 0 and (a_u + 2 * ((f_s - (a_u - (a_u - f_s))) + ((f_tl + f_e) - (a_u - f_s)))) - a_u = 2 * ((f_s - (a_u - (a_u - f_s))) + ((f_tl + f_e) - (a_u - f_s))) and (f_w < 0) = (((f_s - (a_u - (a_u - f_s))) + ((f_tl + f_e) - (a_u - f_s))) < 0) then a_u := a_u + 2 * ((f_s - (a_u - (a_u - f_s))) + ((f_tl + f_e) - (a_u - f_s))); end if;
        elsif (1.5)::float8 = 0 or a_x = 0 then
          a_u := (1.5)::float8 * a_x + (1)::float8;
        else
          a_u := fdlibm_fma_wide(a => (1.5)::float8, b => a_x, c => (1)::float8);
        end if;
        a_x := (a_x - 1.5) / a_u;
      else
        a_id := 3;
        a_x := -1 / a_x;
      end if;
    end if;
    a_z := a_x * a_x;
    a_w := a_z * a_z;
    if abs(a_w) >= 1e-144 and abs(a_w) <= 1e144 and abs((1.62858201153657823623e-02)::float8) >= 1e-144 and abs((1.62858201153657823623e-02)::float8) <= 1e144 and abs((4.97687799461593236017e-02)::float8) <= 1e288 then
      f_p := a_w * (1.62858201153657823623e-02)::float8;
      f_ah := (a_w * 134217729 - (a_w * 134217729 - a_w));
      f_e := (a_w - f_ah) * ((1.62858201153657823623e-02)::float8 - ((1.62858201153657823623e-02)::float8 * 134217729 - ((1.62858201153657823623e-02)::float8 * 134217729 - (1.62858201153657823623e-02)::float8))) - (((f_p - f_ah * ((1.62858201153657823623e-02)::float8 * 134217729 - ((1.62858201153657823623e-02)::float8 * 134217729 - (1.62858201153657823623e-02)::float8))) - (a_w - f_ah) * ((1.62858201153657823623e-02)::float8 * 134217729 - ((1.62858201153657823623e-02)::float8 * 134217729 - (1.62858201153657823623e-02)::float8))) - f_ah * ((1.62858201153657823623e-02)::float8 - ((1.62858201153657823623e-02)::float8 * 134217729 - ((1.62858201153657823623e-02)::float8 * 134217729 - (1.62858201153657823623e-02)::float8))));
      f_s := (4.97687799461593236017e-02)::float8 + f_p;
      f_tl := ((4.97687799461593236017e-02)::float8 - (f_s - (f_s - (4.97687799461593236017e-02)::float8))) + (f_p - (f_s - (4.97687799461593236017e-02)::float8));
      f_w := (f_tl - ((f_tl + f_e) - ((f_tl + f_e) - f_tl))) + (f_e - ((f_tl + f_e) - f_tl));
      a_s1 := f_s + (f_tl + f_e);
      if f_w <> 0 and ((f_s - (a_s1 - (a_s1 - f_s))) + ((f_tl + f_e) - (a_s1 - f_s))) <> 0 and (a_s1 + 2 * ((f_s - (a_s1 - (a_s1 - f_s))) + ((f_tl + f_e) - (a_s1 - f_s)))) - a_s1 = 2 * ((f_s - (a_s1 - (a_s1 - f_s))) + ((f_tl + f_e) - (a_s1 - f_s))) and (f_w < 0) = (((f_s - (a_s1 - (a_s1 - f_s))) + ((f_tl + f_e) - (a_s1 - f_s))) < 0) then a_s1 := a_s1 + 2 * ((f_s - (a_s1 - (a_s1 - f_s))) + ((f_tl + f_e) - (a_s1 - f_s))); end if;
    elsif a_w = 0 or (1.62858201153657823623e-02)::float8 = 0 then
      a_s1 := a_w * (1.62858201153657823623e-02)::float8 + (4.97687799461593236017e-02)::float8;
    else
      a_s1 := fdlibm_fma_wide(a => a_w, b => (1.62858201153657823623e-02)::float8, c => (4.97687799461593236017e-02)::float8);
    end if;
    if abs(a_w) >= 1e-144 and abs(a_w) <= 1e144 and abs(a_s1) >= 1e-144 and abs(a_s1) <= 1e144 and abs((6.66107313738753120669e-02)::float8) <= 1e288 then
      f_p := a_w * a_s1;
      f_ah := (a_w * 134217729 - (a_w * 134217729 - a_w));
      f_bh := (a_s1 * 134217729 - (a_s1 * 134217729 - a_s1));
      f_e := (a_w - f_ah) * (a_s1 - f_bh) - (((f_p - f_ah * f_bh) - (a_w - f_ah) * f_bh) - f_ah * (a_s1 - f_bh));
      f_s := (6.66107313738753120669e-02)::float8 + f_p;
      f_tl := ((6.66107313738753120669e-02)::float8 - (f_s - (f_s - (6.66107313738753120669e-02)::float8))) + (f_p - (f_s - (6.66107313738753120669e-02)::float8));
      f_w := (f_tl - ((f_tl + f_e) - ((f_tl + f_e) - f_tl))) + (f_e - ((f_tl + f_e) - f_tl));
      a_s1 := f_s + (f_tl + f_e);
      if f_w <> 0 and ((f_s - (a_s1 - (a_s1 - f_s))) + ((f_tl + f_e) - (a_s1 - f_s))) <> 0 and (a_s1 + 2 * ((f_s - (a_s1 - (a_s1 - f_s))) + ((f_tl + f_e) - (a_s1 - f_s)))) - a_s1 = 2 * ((f_s - (a_s1 - (a_s1 - f_s))) + ((f_tl + f_e) - (a_s1 - f_s))) and (f_w < 0) = (((f_s - (a_s1 - (a_s1 - f_s))) + ((f_tl + f_e) - (a_s1 - f_s))) < 0) then a_s1 := a_s1 + 2 * ((f_s - (a_s1 - (a_s1 - f_s))) + ((f_tl + f_e) - (a_s1 - f_s))); end if;
    elsif a_w = 0 or a_s1 = 0 then
      a_s1 := a_w * a_s1 + (6.66107313738753120669e-02)::float8;
    else
      a_s1 := fdlibm_fma_wide(a => a_w, b => a_s1, c => (6.66107313738753120669e-02)::float8);
    end if;
    if abs(a_w) >= 1e-144 and abs(a_w) <= 1e144 and abs(a_s1) >= 1e-144 and abs(a_s1) <= 1e144 and abs((9.09088713343650656196e-02)::float8) <= 1e288 then
      f_p := a_w * a_s1;
      f_ah := (a_w * 134217729 - (a_w * 134217729 - a_w));
      f_bh := (a_s1 * 134217729 - (a_s1 * 134217729 - a_s1));
      f_e := (a_w - f_ah) * (a_s1 - f_bh) - (((f_p - f_ah * f_bh) - (a_w - f_ah) * f_bh) - f_ah * (a_s1 - f_bh));
      f_s := (9.09088713343650656196e-02)::float8 + f_p;
      f_tl := ((9.09088713343650656196e-02)::float8 - (f_s - (f_s - (9.09088713343650656196e-02)::float8))) + (f_p - (f_s - (9.09088713343650656196e-02)::float8));
      f_w := (f_tl - ((f_tl + f_e) - ((f_tl + f_e) - f_tl))) + (f_e - ((f_tl + f_e) - f_tl));
      a_s1 := f_s + (f_tl + f_e);
      if f_w <> 0 and ((f_s - (a_s1 - (a_s1 - f_s))) + ((f_tl + f_e) - (a_s1 - f_s))) <> 0 and (a_s1 + 2 * ((f_s - (a_s1 - (a_s1 - f_s))) + ((f_tl + f_e) - (a_s1 - f_s)))) - a_s1 = 2 * ((f_s - (a_s1 - (a_s1 - f_s))) + ((f_tl + f_e) - (a_s1 - f_s))) and (f_w < 0) = (((f_s - (a_s1 - (a_s1 - f_s))) + ((f_tl + f_e) - (a_s1 - f_s))) < 0) then a_s1 := a_s1 + 2 * ((f_s - (a_s1 - (a_s1 - f_s))) + ((f_tl + f_e) - (a_s1 - f_s))); end if;
    elsif a_w = 0 or a_s1 = 0 then
      a_s1 := a_w * a_s1 + (9.09088713343650656196e-02)::float8;
    else
      a_s1 := fdlibm_fma_wide(a => a_w, b => a_s1, c => (9.09088713343650656196e-02)::float8);
    end if;
    if abs(a_w) >= 1e-144 and abs(a_w) <= 1e144 and abs(a_s1) >= 1e-144 and abs(a_s1) <= 1e144 and abs((1.42857142725034663711e-01)::float8) <= 1e288 then
      f_p := a_w * a_s1;
      f_ah := (a_w * 134217729 - (a_w * 134217729 - a_w));
      f_bh := (a_s1 * 134217729 - (a_s1 * 134217729 - a_s1));
      f_e := (a_w - f_ah) * (a_s1 - f_bh) - (((f_p - f_ah * f_bh) - (a_w - f_ah) * f_bh) - f_ah * (a_s1 - f_bh));
      f_s := (1.42857142725034663711e-01)::float8 + f_p;
      f_tl := ((1.42857142725034663711e-01)::float8 - (f_s - (f_s - (1.42857142725034663711e-01)::float8))) + (f_p - (f_s - (1.42857142725034663711e-01)::float8));
      f_w := (f_tl - ((f_tl + f_e) - ((f_tl + f_e) - f_tl))) + (f_e - ((f_tl + f_e) - f_tl));
      a_s1 := f_s + (f_tl + f_e);
      if f_w <> 0 and ((f_s - (a_s1 - (a_s1 - f_s))) + ((f_tl + f_e) - (a_s1 - f_s))) <> 0 and (a_s1 + 2 * ((f_s - (a_s1 - (a_s1 - f_s))) + ((f_tl + f_e) - (a_s1 - f_s)))) - a_s1 = 2 * ((f_s - (a_s1 - (a_s1 - f_s))) + ((f_tl + f_e) - (a_s1 - f_s))) and (f_w < 0) = (((f_s - (a_s1 - (a_s1 - f_s))) + ((f_tl + f_e) - (a_s1 - f_s))) < 0) then a_s1 := a_s1 + 2 * ((f_s - (a_s1 - (a_s1 - f_s))) + ((f_tl + f_e) - (a_s1 - f_s))); end if;
    elsif a_w = 0 or a_s1 = 0 then
      a_s1 := a_w * a_s1 + (1.42857142725034663711e-01)::float8;
    else
      a_s1 := fdlibm_fma_wide(a => a_w, b => a_s1, c => (1.42857142725034663711e-01)::float8);
    end if;
    if abs(a_w) >= 1e-144 and abs(a_w) <= 1e144 and abs(a_s1) >= 1e-144 and abs(a_s1) <= 1e144 and abs((3.33333333333329318027e-01)::float8) <= 1e288 then
      f_p := a_w * a_s1;
      f_ah := (a_w * 134217729 - (a_w * 134217729 - a_w));
      f_bh := (a_s1 * 134217729 - (a_s1 * 134217729 - a_s1));
      f_e := (a_w - f_ah) * (a_s1 - f_bh) - (((f_p - f_ah * f_bh) - (a_w - f_ah) * f_bh) - f_ah * (a_s1 - f_bh));
      f_s := (3.33333333333329318027e-01)::float8 + f_p;
      f_tl := ((3.33333333333329318027e-01)::float8 - (f_s - (f_s - (3.33333333333329318027e-01)::float8))) + (f_p - (f_s - (3.33333333333329318027e-01)::float8));
      f_w := (f_tl - ((f_tl + f_e) - ((f_tl + f_e) - f_tl))) + (f_e - ((f_tl + f_e) - f_tl));
      a_s1 := f_s + (f_tl + f_e);
      if f_w <> 0 and ((f_s - (a_s1 - (a_s1 - f_s))) + ((f_tl + f_e) - (a_s1 - f_s))) <> 0 and (a_s1 + 2 * ((f_s - (a_s1 - (a_s1 - f_s))) + ((f_tl + f_e) - (a_s1 - f_s)))) - a_s1 = 2 * ((f_s - (a_s1 - (a_s1 - f_s))) + ((f_tl + f_e) - (a_s1 - f_s))) and (f_w < 0) = (((f_s - (a_s1 - (a_s1 - f_s))) + ((f_tl + f_e) - (a_s1 - f_s))) < 0) then a_s1 := a_s1 + 2 * ((f_s - (a_s1 - (a_s1 - f_s))) + ((f_tl + f_e) - (a_s1 - f_s))); end if;
    elsif a_w = 0 or a_s1 = 0 then
      a_s1 := a_w * a_s1 + (3.33333333333329318027e-01)::float8;
    else
      a_s1 := fdlibm_fma_wide(a => a_w, b => a_s1, c => (3.33333333333329318027e-01)::float8);
    end if;
    a_s1 := a_z * a_s1;
    if abs(a_w) >= 1e-144 and abs(a_w) <= 1e144 and abs((-3.65315727442169155270e-02)::float8) >= 1e-144 and abs((-3.65315727442169155270e-02)::float8) <= 1e144 and abs((-5.83357013379057348645e-02)::float8) <= 1e288 then
      f_p := a_w * (-3.65315727442169155270e-02)::float8;
      f_ah := (a_w * 134217729 - (a_w * 134217729 - a_w));
      f_e := (a_w - f_ah) * ((-3.65315727442169155270e-02)::float8 - ((-3.65315727442169155270e-02)::float8 * 134217729 - ((-3.65315727442169155270e-02)::float8 * 134217729 - (-3.65315727442169155270e-02)::float8))) - (((f_p - f_ah * ((-3.65315727442169155270e-02)::float8 * 134217729 - ((-3.65315727442169155270e-02)::float8 * 134217729 - (-3.65315727442169155270e-02)::float8))) - (a_w - f_ah) * ((-3.65315727442169155270e-02)::float8 * 134217729 - ((-3.65315727442169155270e-02)::float8 * 134217729 - (-3.65315727442169155270e-02)::float8))) - f_ah * ((-3.65315727442169155270e-02)::float8 - ((-3.65315727442169155270e-02)::float8 * 134217729 - ((-3.65315727442169155270e-02)::float8 * 134217729 - (-3.65315727442169155270e-02)::float8))));
      f_s := (-5.83357013379057348645e-02)::float8 + f_p;
      f_tl := ((-5.83357013379057348645e-02)::float8 - (f_s - (f_s - (-5.83357013379057348645e-02)::float8))) + (f_p - (f_s - (-5.83357013379057348645e-02)::float8));
      f_w := (f_tl - ((f_tl + f_e) - ((f_tl + f_e) - f_tl))) + (f_e - ((f_tl + f_e) - f_tl));
      a_s2 := f_s + (f_tl + f_e);
      if f_w <> 0 and ((f_s - (a_s2 - (a_s2 - f_s))) + ((f_tl + f_e) - (a_s2 - f_s))) <> 0 and (a_s2 + 2 * ((f_s - (a_s2 - (a_s2 - f_s))) + ((f_tl + f_e) - (a_s2 - f_s)))) - a_s2 = 2 * ((f_s - (a_s2 - (a_s2 - f_s))) + ((f_tl + f_e) - (a_s2 - f_s))) and (f_w < 0) = (((f_s - (a_s2 - (a_s2 - f_s))) + ((f_tl + f_e) - (a_s2 - f_s))) < 0) then a_s2 := a_s2 + 2 * ((f_s - (a_s2 - (a_s2 - f_s))) + ((f_tl + f_e) - (a_s2 - f_s))); end if;
    elsif a_w = 0 or (-3.65315727442169155270e-02)::float8 = 0 then
      a_s2 := a_w * (-3.65315727442169155270e-02)::float8 + (-5.83357013379057348645e-02)::float8;
    else
      a_s2 := fdlibm_fma_wide(a => a_w, b => (-3.65315727442169155270e-02)::float8, c => (-5.83357013379057348645e-02)::float8);
    end if;
    if abs(a_w) >= 1e-144 and abs(a_w) <= 1e144 and abs(a_s2) >= 1e-144 and abs(a_s2) <= 1e144 and abs((-7.69187620504482999495e-02)::float8) <= 1e288 then
      f_p := a_w * a_s2;
      f_ah := (a_w * 134217729 - (a_w * 134217729 - a_w));
      f_bh := (a_s2 * 134217729 - (a_s2 * 134217729 - a_s2));
      f_e := (a_w - f_ah) * (a_s2 - f_bh) - (((f_p - f_ah * f_bh) - (a_w - f_ah) * f_bh) - f_ah * (a_s2 - f_bh));
      f_s := (-7.69187620504482999495e-02)::float8 + f_p;
      f_tl := ((-7.69187620504482999495e-02)::float8 - (f_s - (f_s - (-7.69187620504482999495e-02)::float8))) + (f_p - (f_s - (-7.69187620504482999495e-02)::float8));
      f_w := (f_tl - ((f_tl + f_e) - ((f_tl + f_e) - f_tl))) + (f_e - ((f_tl + f_e) - f_tl));
      a_s2 := f_s + (f_tl + f_e);
      if f_w <> 0 and ((f_s - (a_s2 - (a_s2 - f_s))) + ((f_tl + f_e) - (a_s2 - f_s))) <> 0 and (a_s2 + 2 * ((f_s - (a_s2 - (a_s2 - f_s))) + ((f_tl + f_e) - (a_s2 - f_s)))) - a_s2 = 2 * ((f_s - (a_s2 - (a_s2 - f_s))) + ((f_tl + f_e) - (a_s2 - f_s))) and (f_w < 0) = (((f_s - (a_s2 - (a_s2 - f_s))) + ((f_tl + f_e) - (a_s2 - f_s))) < 0) then a_s2 := a_s2 + 2 * ((f_s - (a_s2 - (a_s2 - f_s))) + ((f_tl + f_e) - (a_s2 - f_s))); end if;
    elsif a_w = 0 or a_s2 = 0 then
      a_s2 := a_w * a_s2 + (-7.69187620504482999495e-02)::float8;
    else
      a_s2 := fdlibm_fma_wide(a => a_w, b => a_s2, c => (-7.69187620504482999495e-02)::float8);
    end if;
    if abs(a_w) >= 1e-144 and abs(a_w) <= 1e144 and abs(a_s2) >= 1e-144 and abs(a_s2) <= 1e144 and abs((-1.11111104054623557880e-01)::float8) <= 1e288 then
      f_p := a_w * a_s2;
      f_ah := (a_w * 134217729 - (a_w * 134217729 - a_w));
      f_bh := (a_s2 * 134217729 - (a_s2 * 134217729 - a_s2));
      f_e := (a_w - f_ah) * (a_s2 - f_bh) - (((f_p - f_ah * f_bh) - (a_w - f_ah) * f_bh) - f_ah * (a_s2 - f_bh));
      f_s := (-1.11111104054623557880e-01)::float8 + f_p;
      f_tl := ((-1.11111104054623557880e-01)::float8 - (f_s - (f_s - (-1.11111104054623557880e-01)::float8))) + (f_p - (f_s - (-1.11111104054623557880e-01)::float8));
      f_w := (f_tl - ((f_tl + f_e) - ((f_tl + f_e) - f_tl))) + (f_e - ((f_tl + f_e) - f_tl));
      a_s2 := f_s + (f_tl + f_e);
      if f_w <> 0 and ((f_s - (a_s2 - (a_s2 - f_s))) + ((f_tl + f_e) - (a_s2 - f_s))) <> 0 and (a_s2 + 2 * ((f_s - (a_s2 - (a_s2 - f_s))) + ((f_tl + f_e) - (a_s2 - f_s)))) - a_s2 = 2 * ((f_s - (a_s2 - (a_s2 - f_s))) + ((f_tl + f_e) - (a_s2 - f_s))) and (f_w < 0) = (((f_s - (a_s2 - (a_s2 - f_s))) + ((f_tl + f_e) - (a_s2 - f_s))) < 0) then a_s2 := a_s2 + 2 * ((f_s - (a_s2 - (a_s2 - f_s))) + ((f_tl + f_e) - (a_s2 - f_s))); end if;
    elsif a_w = 0 or a_s2 = 0 then
      a_s2 := a_w * a_s2 + (-1.11111104054623557880e-01)::float8;
    else
      a_s2 := fdlibm_fma_wide(a => a_w, b => a_s2, c => (-1.11111104054623557880e-01)::float8);
    end if;
    if abs(a_w) >= 1e-144 and abs(a_w) <= 1e144 and abs(a_s2) >= 1e-144 and abs(a_s2) <= 1e144 and abs((-1.99999999998764832476e-01)::float8) <= 1e288 then
      f_p := a_w * a_s2;
      f_ah := (a_w * 134217729 - (a_w * 134217729 - a_w));
      f_bh := (a_s2 * 134217729 - (a_s2 * 134217729 - a_s2));
      f_e := (a_w - f_ah) * (a_s2 - f_bh) - (((f_p - f_ah * f_bh) - (a_w - f_ah) * f_bh) - f_ah * (a_s2 - f_bh));
      f_s := (-1.99999999998764832476e-01)::float8 + f_p;
      f_tl := ((-1.99999999998764832476e-01)::float8 - (f_s - (f_s - (-1.99999999998764832476e-01)::float8))) + (f_p - (f_s - (-1.99999999998764832476e-01)::float8));
      f_w := (f_tl - ((f_tl + f_e) - ((f_tl + f_e) - f_tl))) + (f_e - ((f_tl + f_e) - f_tl));
      a_s2 := f_s + (f_tl + f_e);
      if f_w <> 0 and ((f_s - (a_s2 - (a_s2 - f_s))) + ((f_tl + f_e) - (a_s2 - f_s))) <> 0 and (a_s2 + 2 * ((f_s - (a_s2 - (a_s2 - f_s))) + ((f_tl + f_e) - (a_s2 - f_s)))) - a_s2 = 2 * ((f_s - (a_s2 - (a_s2 - f_s))) + ((f_tl + f_e) - (a_s2 - f_s))) and (f_w < 0) = (((f_s - (a_s2 - (a_s2 - f_s))) + ((f_tl + f_e) - (a_s2 - f_s))) < 0) then a_s2 := a_s2 + 2 * ((f_s - (a_s2 - (a_s2 - f_s))) + ((f_tl + f_e) - (a_s2 - f_s))); end if;
    elsif a_w = 0 or a_s2 = 0 then
      a_s2 := a_w * a_s2 + (-1.99999999998764832476e-01)::float8;
    else
      a_s2 := fdlibm_fma_wide(a => a_w, b => a_s2, c => (-1.99999999998764832476e-01)::float8);
    end if;
    a_s2 := a_w * a_s2;
    if a_id < 0 then
      f_b := a_s1 + a_s2;
      if abs(-a_x) >= 1e-144 and abs(-a_x) <= 1e144 and abs(f_b) >= 1e-144 and abs(f_b) <= 1e144 and abs(a_x) <= 1e288 then
        f_p := -a_x * f_b;
        f_ah := (-a_x * 134217729 - (-a_x * 134217729 - -a_x));
        f_bh := (f_b * 134217729 - (f_b * 134217729 - f_b));
        f_e := (-a_x - f_ah) * (f_b - f_bh) - (((f_p - f_ah * f_bh) - (-a_x - f_ah) * f_bh) - f_ah * (f_b - f_bh));
        f_s := a_x + f_p;
        f_tl := (a_x - (f_s - (f_s - a_x))) + (f_p - (f_s - a_x));
        f_w := (f_tl - ((f_tl + f_e) - ((f_tl + f_e) - f_tl))) + (f_e - ((f_tl + f_e) - f_tl));
        a_u := f_s + (f_tl + f_e);
        if f_w <> 0 and ((f_s - (a_u - (a_u - f_s))) + ((f_tl + f_e) - (a_u - f_s))) <> 0 and (a_u + 2 * ((f_s - (a_u - (a_u - f_s))) + ((f_tl + f_e) - (a_u - f_s)))) - a_u = 2 * ((f_s - (a_u - (a_u - f_s))) + ((f_tl + f_e) - (a_u - f_s))) and (f_w < 0) = (((f_s - (a_u - (a_u - f_s))) + ((f_tl + f_e) - (a_u - f_s))) < 0) then a_u := a_u + 2 * ((f_s - (a_u - (a_u - f_s))) + ((f_tl + f_e) - (a_u - f_s))); end if;
      elsif -a_x = 0 or f_b = 0 then
        a_u := -a_x * f_b + a_x;
      else
        a_u := fdlibm_fma_wide(a => -a_x, b => f_b, c => a_x);
      end if;
      z := a_u; exit;
    end if;
    f_b := a_s1 + a_s2;
    f_c := -case a_id when 0 then 2.26987774529616870924e-17 when 1 then 3.06161699786838301793e-17 when 2 then 1.39033110312309984516e-17 else 6.12323399573676603587e-17 end;
    if abs(a_x) >= 1e-144 and abs(a_x) <= 1e144 and abs(f_b) >= 1e-144 and abs(f_b) <= 1e144 and abs(f_c) <= 1e288 then
      f_p := a_x * f_b;
      f_ah := (a_x * 134217729 - (a_x * 134217729 - a_x));
      f_bh := (f_b * 134217729 - (f_b * 134217729 - f_b));
      f_e := (a_x - f_ah) * (f_b - f_bh) - (((f_p - f_ah * f_bh) - (a_x - f_ah) * f_bh) - f_ah * (f_b - f_bh));
      f_s := f_c + f_p;
      f_tl := (f_c - (f_s - (f_s - f_c))) + (f_p - (f_s - f_c));
      f_w := (f_tl - ((f_tl + f_e) - ((f_tl + f_e) - f_tl))) + (f_e - ((f_tl + f_e) - f_tl));
      a_u := f_s + (f_tl + f_e);
      if f_w <> 0 and ((f_s - (a_u - (a_u - f_s))) + ((f_tl + f_e) - (a_u - f_s))) <> 0 and (a_u + 2 * ((f_s - (a_u - (a_u - f_s))) + ((f_tl + f_e) - (a_u - f_s)))) - a_u = 2 * ((f_s - (a_u - (a_u - f_s))) + ((f_tl + f_e) - (a_u - f_s))) and (f_w < 0) = (((f_s - (a_u - (a_u - f_s))) + ((f_tl + f_e) - (a_u - f_s))) < 0) then a_u := a_u + 2 * ((f_s - (a_u - (a_u - f_s))) + ((f_tl + f_e) - (a_u - f_s))); end if;
    elsif a_x = 0 or f_b = 0 then
      a_u := a_x * f_b + f_c;
    else
      a_u := fdlibm_fma_wide(a => a_x, b => f_b, c => f_c);
    end if;
    a_z := case a_id when 0 then 4.63647609000806093515e-01 when 1 then 7.85398163397448278999e-01
      when 2 then 9.82793723247329054082e-01 else 1.57079632679489655800e+00 end - (a_u - a_x);
    z := case when a_hx < 0 then -a_z else a_z end; exit;
  end loop;

    return z;
  end if;
  m := ((hy >> 31) & 1) | ((hx >> 30) & 2);
  if iy = 0 and ly = 0 then
    return case when m <= 1 then y when m = 2 then 3.1415926535897931160E+00::float8 + 1.0e-300::float8 else -3.1415926535897931160E+00::float8 - 1.0e-300::float8 end;
  end if;
  if ix = 0 and lx = 0 then
    return case when hy < 0 then -1.5707963267948965580E+00::float8 - 1.0e-300::float8 else 1.5707963267948965580E+00::float8 + 1.0e-300::float8 end;
  end if;
  if ix = 0x7FF00000 then
    if iy = 0x7FF00000 then
      return case m when 0 then 7.8539816339744827900E-01::float8 + 1.0e-300::float8 when 1 then -7.8539816339744827900E-01::float8 - 1.0e-300::float8
        when 2 then 3 * 7.8539816339744827900E-01::float8 + 1.0e-300::float8 else -3 * 7.8539816339744827900E-01::float8 - 1.0e-300::float8 end;
    end if;
    return case m when 0 then 0::float8 when 1 then '-0'::float8 when 2 then 3.1415926535897931160E+00::float8 + 1.0e-300::float8
      else -3.1415926535897931160E+00::float8 - 1.0e-300::float8 end;
  end if;
  if iy = 0x7FF00000 then
    return case when hy < 0 then -1.5707963267948965580E+00::float8 - 1.0e-300::float8 else 1.5707963267948965580E+00::float8 + 1.0e-300::float8 end;
  end if;
  k := (iy - ix) >> 20;
  if k > 60 then
    z := 1.5707963267948965580E+00::float8 + 0.5 * 1.2246467991473531772E-16::float8;
    m := m & 1;
  elsif hx < 0 and k < -60 then
    z := 0;
  elsif k < -1000 then
    begin
      z := abs(y / x);
    exception when numeric_value_out_of_range then
      z := 0;
    end;
  loop
    a_x := z;
    a_hx := (int8(float8send(a_x)) >> 32)::int;
    a_ix := a_hx & 2147483647;
    if a_ix >= 0x44100000 then
      if a_ix > 0x7FF00000 or (a_ix = 0x7FF00000 and (int8(float8send(a_x)) & 4294967295) <> 0) then z := a_x; exit; end if;
      if a_hx > 0 then z := 1.57079632679489655800e+00::float8 + 6.12323399573676603587e-17::float8; exit; end if;
      z := -1.57079632679489655800e+00::float8 - 6.12323399573676603587e-17::float8; exit;
    end if;
    if a_ix < 0x3FDC0000 then
      if a_ix < 0x3E400000 then z := a_x; exit; end if;
      a_id := -1;
    else
      a_x := abs(a_x);
      if a_ix < 0x3FF30000 then
        if a_ix < 0x3FE60000 then
          a_id := 0;
          a_x := (2 * a_x - 1) / (2 + a_x);
        else
          a_id := 1;
          a_x := (a_x - 1) / (a_x + 1);
        end if;
      elsif a_ix < 0x40038000 then
        a_id := 2;
        if abs((1.5)::float8) >= 1e-144 and abs((1.5)::float8) <= 1e144 and abs(a_x) >= 1e-144 and abs(a_x) <= 1e144 and abs((1)::float8) <= 1e288 then
          f_p := (1.5)::float8 * a_x;
          f_bh := (a_x * 134217729 - (a_x * 134217729 - a_x));
          f_e := ((1.5)::float8 - ((1.5)::float8 * 134217729 - ((1.5)::float8 * 134217729 - (1.5)::float8))) * (a_x - f_bh) - (((f_p - ((1.5)::float8 * 134217729 - ((1.5)::float8 * 134217729 - (1.5)::float8)) * f_bh) - ((1.5)::float8 - ((1.5)::float8 * 134217729 - ((1.5)::float8 * 134217729 - (1.5)::float8))) * f_bh) - ((1.5)::float8 * 134217729 - ((1.5)::float8 * 134217729 - (1.5)::float8)) * (a_x - f_bh));
          f_s := (1)::float8 + f_p;
          f_tl := ((1)::float8 - (f_s - (f_s - (1)::float8))) + (f_p - (f_s - (1)::float8));
          f_w := (f_tl - ((f_tl + f_e) - ((f_tl + f_e) - f_tl))) + (f_e - ((f_tl + f_e) - f_tl));
          a_u := f_s + (f_tl + f_e);
          if f_w <> 0 and ((f_s - (a_u - (a_u - f_s))) + ((f_tl + f_e) - (a_u - f_s))) <> 0 and (a_u + 2 * ((f_s - (a_u - (a_u - f_s))) + ((f_tl + f_e) - (a_u - f_s)))) - a_u = 2 * ((f_s - (a_u - (a_u - f_s))) + ((f_tl + f_e) - (a_u - f_s))) and (f_w < 0) = (((f_s - (a_u - (a_u - f_s))) + ((f_tl + f_e) - (a_u - f_s))) < 0) then a_u := a_u + 2 * ((f_s - (a_u - (a_u - f_s))) + ((f_tl + f_e) - (a_u - f_s))); end if;
        elsif (1.5)::float8 = 0 or a_x = 0 then
          a_u := (1.5)::float8 * a_x + (1)::float8;
        else
          a_u := fdlibm_fma_wide(a => (1.5)::float8, b => a_x, c => (1)::float8);
        end if;
        a_x := (a_x - 1.5) / a_u;
      else
        a_id := 3;
        a_x := -1 / a_x;
      end if;
    end if;
    a_z := a_x * a_x;
    a_w := a_z * a_z;
    if abs(a_w) >= 1e-144 and abs(a_w) <= 1e144 and abs((1.62858201153657823623e-02)::float8) >= 1e-144 and abs((1.62858201153657823623e-02)::float8) <= 1e144 and abs((4.97687799461593236017e-02)::float8) <= 1e288 then
      f_p := a_w * (1.62858201153657823623e-02)::float8;
      f_ah := (a_w * 134217729 - (a_w * 134217729 - a_w));
      f_e := (a_w - f_ah) * ((1.62858201153657823623e-02)::float8 - ((1.62858201153657823623e-02)::float8 * 134217729 - ((1.62858201153657823623e-02)::float8 * 134217729 - (1.62858201153657823623e-02)::float8))) - (((f_p - f_ah * ((1.62858201153657823623e-02)::float8 * 134217729 - ((1.62858201153657823623e-02)::float8 * 134217729 - (1.62858201153657823623e-02)::float8))) - (a_w - f_ah) * ((1.62858201153657823623e-02)::float8 * 134217729 - ((1.62858201153657823623e-02)::float8 * 134217729 - (1.62858201153657823623e-02)::float8))) - f_ah * ((1.62858201153657823623e-02)::float8 - ((1.62858201153657823623e-02)::float8 * 134217729 - ((1.62858201153657823623e-02)::float8 * 134217729 - (1.62858201153657823623e-02)::float8))));
      f_s := (4.97687799461593236017e-02)::float8 + f_p;
      f_tl := ((4.97687799461593236017e-02)::float8 - (f_s - (f_s - (4.97687799461593236017e-02)::float8))) + (f_p - (f_s - (4.97687799461593236017e-02)::float8));
      f_w := (f_tl - ((f_tl + f_e) - ((f_tl + f_e) - f_tl))) + (f_e - ((f_tl + f_e) - f_tl));
      a_s1 := f_s + (f_tl + f_e);
      if f_w <> 0 and ((f_s - (a_s1 - (a_s1 - f_s))) + ((f_tl + f_e) - (a_s1 - f_s))) <> 0 and (a_s1 + 2 * ((f_s - (a_s1 - (a_s1 - f_s))) + ((f_tl + f_e) - (a_s1 - f_s)))) - a_s1 = 2 * ((f_s - (a_s1 - (a_s1 - f_s))) + ((f_tl + f_e) - (a_s1 - f_s))) and (f_w < 0) = (((f_s - (a_s1 - (a_s1 - f_s))) + ((f_tl + f_e) - (a_s1 - f_s))) < 0) then a_s1 := a_s1 + 2 * ((f_s - (a_s1 - (a_s1 - f_s))) + ((f_tl + f_e) - (a_s1 - f_s))); end if;
    elsif a_w = 0 or (1.62858201153657823623e-02)::float8 = 0 then
      a_s1 := a_w * (1.62858201153657823623e-02)::float8 + (4.97687799461593236017e-02)::float8;
    else
      a_s1 := fdlibm_fma_wide(a => a_w, b => (1.62858201153657823623e-02)::float8, c => (4.97687799461593236017e-02)::float8);
    end if;
    if abs(a_w) >= 1e-144 and abs(a_w) <= 1e144 and abs(a_s1) >= 1e-144 and abs(a_s1) <= 1e144 and abs((6.66107313738753120669e-02)::float8) <= 1e288 then
      f_p := a_w * a_s1;
      f_ah := (a_w * 134217729 - (a_w * 134217729 - a_w));
      f_bh := (a_s1 * 134217729 - (a_s1 * 134217729 - a_s1));
      f_e := (a_w - f_ah) * (a_s1 - f_bh) - (((f_p - f_ah * f_bh) - (a_w - f_ah) * f_bh) - f_ah * (a_s1 - f_bh));
      f_s := (6.66107313738753120669e-02)::float8 + f_p;
      f_tl := ((6.66107313738753120669e-02)::float8 - (f_s - (f_s - (6.66107313738753120669e-02)::float8))) + (f_p - (f_s - (6.66107313738753120669e-02)::float8));
      f_w := (f_tl - ((f_tl + f_e) - ((f_tl + f_e) - f_tl))) + (f_e - ((f_tl + f_e) - f_tl));
      a_s1 := f_s + (f_tl + f_e);
      if f_w <> 0 and ((f_s - (a_s1 - (a_s1 - f_s))) + ((f_tl + f_e) - (a_s1 - f_s))) <> 0 and (a_s1 + 2 * ((f_s - (a_s1 - (a_s1 - f_s))) + ((f_tl + f_e) - (a_s1 - f_s)))) - a_s1 = 2 * ((f_s - (a_s1 - (a_s1 - f_s))) + ((f_tl + f_e) - (a_s1 - f_s))) and (f_w < 0) = (((f_s - (a_s1 - (a_s1 - f_s))) + ((f_tl + f_e) - (a_s1 - f_s))) < 0) then a_s1 := a_s1 + 2 * ((f_s - (a_s1 - (a_s1 - f_s))) + ((f_tl + f_e) - (a_s1 - f_s))); end if;
    elsif a_w = 0 or a_s1 = 0 then
      a_s1 := a_w * a_s1 + (6.66107313738753120669e-02)::float8;
    else
      a_s1 := fdlibm_fma_wide(a => a_w, b => a_s1, c => (6.66107313738753120669e-02)::float8);
    end if;
    if abs(a_w) >= 1e-144 and abs(a_w) <= 1e144 and abs(a_s1) >= 1e-144 and abs(a_s1) <= 1e144 and abs((9.09088713343650656196e-02)::float8) <= 1e288 then
      f_p := a_w * a_s1;
      f_ah := (a_w * 134217729 - (a_w * 134217729 - a_w));
      f_bh := (a_s1 * 134217729 - (a_s1 * 134217729 - a_s1));
      f_e := (a_w - f_ah) * (a_s1 - f_bh) - (((f_p - f_ah * f_bh) - (a_w - f_ah) * f_bh) - f_ah * (a_s1 - f_bh));
      f_s := (9.09088713343650656196e-02)::float8 + f_p;
      f_tl := ((9.09088713343650656196e-02)::float8 - (f_s - (f_s - (9.09088713343650656196e-02)::float8))) + (f_p - (f_s - (9.09088713343650656196e-02)::float8));
      f_w := (f_tl - ((f_tl + f_e) - ((f_tl + f_e) - f_tl))) + (f_e - ((f_tl + f_e) - f_tl));
      a_s1 := f_s + (f_tl + f_e);
      if f_w <> 0 and ((f_s - (a_s1 - (a_s1 - f_s))) + ((f_tl + f_e) - (a_s1 - f_s))) <> 0 and (a_s1 + 2 * ((f_s - (a_s1 - (a_s1 - f_s))) + ((f_tl + f_e) - (a_s1 - f_s)))) - a_s1 = 2 * ((f_s - (a_s1 - (a_s1 - f_s))) + ((f_tl + f_e) - (a_s1 - f_s))) and (f_w < 0) = (((f_s - (a_s1 - (a_s1 - f_s))) + ((f_tl + f_e) - (a_s1 - f_s))) < 0) then a_s1 := a_s1 + 2 * ((f_s - (a_s1 - (a_s1 - f_s))) + ((f_tl + f_e) - (a_s1 - f_s))); end if;
    elsif a_w = 0 or a_s1 = 0 then
      a_s1 := a_w * a_s1 + (9.09088713343650656196e-02)::float8;
    else
      a_s1 := fdlibm_fma_wide(a => a_w, b => a_s1, c => (9.09088713343650656196e-02)::float8);
    end if;
    if abs(a_w) >= 1e-144 and abs(a_w) <= 1e144 and abs(a_s1) >= 1e-144 and abs(a_s1) <= 1e144 and abs((1.42857142725034663711e-01)::float8) <= 1e288 then
      f_p := a_w * a_s1;
      f_ah := (a_w * 134217729 - (a_w * 134217729 - a_w));
      f_bh := (a_s1 * 134217729 - (a_s1 * 134217729 - a_s1));
      f_e := (a_w - f_ah) * (a_s1 - f_bh) - (((f_p - f_ah * f_bh) - (a_w - f_ah) * f_bh) - f_ah * (a_s1 - f_bh));
      f_s := (1.42857142725034663711e-01)::float8 + f_p;
      f_tl := ((1.42857142725034663711e-01)::float8 - (f_s - (f_s - (1.42857142725034663711e-01)::float8))) + (f_p - (f_s - (1.42857142725034663711e-01)::float8));
      f_w := (f_tl - ((f_tl + f_e) - ((f_tl + f_e) - f_tl))) + (f_e - ((f_tl + f_e) - f_tl));
      a_s1 := f_s + (f_tl + f_e);
      if f_w <> 0 and ((f_s - (a_s1 - (a_s1 - f_s))) + ((f_tl + f_e) - (a_s1 - f_s))) <> 0 and (a_s1 + 2 * ((f_s - (a_s1 - (a_s1 - f_s))) + ((f_tl + f_e) - (a_s1 - f_s)))) - a_s1 = 2 * ((f_s - (a_s1 - (a_s1 - f_s))) + ((f_tl + f_e) - (a_s1 - f_s))) and (f_w < 0) = (((f_s - (a_s1 - (a_s1 - f_s))) + ((f_tl + f_e) - (a_s1 - f_s))) < 0) then a_s1 := a_s1 + 2 * ((f_s - (a_s1 - (a_s1 - f_s))) + ((f_tl + f_e) - (a_s1 - f_s))); end if;
    elsif a_w = 0 or a_s1 = 0 then
      a_s1 := a_w * a_s1 + (1.42857142725034663711e-01)::float8;
    else
      a_s1 := fdlibm_fma_wide(a => a_w, b => a_s1, c => (1.42857142725034663711e-01)::float8);
    end if;
    if abs(a_w) >= 1e-144 and abs(a_w) <= 1e144 and abs(a_s1) >= 1e-144 and abs(a_s1) <= 1e144 and abs((3.33333333333329318027e-01)::float8) <= 1e288 then
      f_p := a_w * a_s1;
      f_ah := (a_w * 134217729 - (a_w * 134217729 - a_w));
      f_bh := (a_s1 * 134217729 - (a_s1 * 134217729 - a_s1));
      f_e := (a_w - f_ah) * (a_s1 - f_bh) - (((f_p - f_ah * f_bh) - (a_w - f_ah) * f_bh) - f_ah * (a_s1 - f_bh));
      f_s := (3.33333333333329318027e-01)::float8 + f_p;
      f_tl := ((3.33333333333329318027e-01)::float8 - (f_s - (f_s - (3.33333333333329318027e-01)::float8))) + (f_p - (f_s - (3.33333333333329318027e-01)::float8));
      f_w := (f_tl - ((f_tl + f_e) - ((f_tl + f_e) - f_tl))) + (f_e - ((f_tl + f_e) - f_tl));
      a_s1 := f_s + (f_tl + f_e);
      if f_w <> 0 and ((f_s - (a_s1 - (a_s1 - f_s))) + ((f_tl + f_e) - (a_s1 - f_s))) <> 0 and (a_s1 + 2 * ((f_s - (a_s1 - (a_s1 - f_s))) + ((f_tl + f_e) - (a_s1 - f_s)))) - a_s1 = 2 * ((f_s - (a_s1 - (a_s1 - f_s))) + ((f_tl + f_e) - (a_s1 - f_s))) and (f_w < 0) = (((f_s - (a_s1 - (a_s1 - f_s))) + ((f_tl + f_e) - (a_s1 - f_s))) < 0) then a_s1 := a_s1 + 2 * ((f_s - (a_s1 - (a_s1 - f_s))) + ((f_tl + f_e) - (a_s1 - f_s))); end if;
    elsif a_w = 0 or a_s1 = 0 then
      a_s1 := a_w * a_s1 + (3.33333333333329318027e-01)::float8;
    else
      a_s1 := fdlibm_fma_wide(a => a_w, b => a_s1, c => (3.33333333333329318027e-01)::float8);
    end if;
    a_s1 := a_z * a_s1;
    if abs(a_w) >= 1e-144 and abs(a_w) <= 1e144 and abs((-3.65315727442169155270e-02)::float8) >= 1e-144 and abs((-3.65315727442169155270e-02)::float8) <= 1e144 and abs((-5.83357013379057348645e-02)::float8) <= 1e288 then
      f_p := a_w * (-3.65315727442169155270e-02)::float8;
      f_ah := (a_w * 134217729 - (a_w * 134217729 - a_w));
      f_e := (a_w - f_ah) * ((-3.65315727442169155270e-02)::float8 - ((-3.65315727442169155270e-02)::float8 * 134217729 - ((-3.65315727442169155270e-02)::float8 * 134217729 - (-3.65315727442169155270e-02)::float8))) - (((f_p - f_ah * ((-3.65315727442169155270e-02)::float8 * 134217729 - ((-3.65315727442169155270e-02)::float8 * 134217729 - (-3.65315727442169155270e-02)::float8))) - (a_w - f_ah) * ((-3.65315727442169155270e-02)::float8 * 134217729 - ((-3.65315727442169155270e-02)::float8 * 134217729 - (-3.65315727442169155270e-02)::float8))) - f_ah * ((-3.65315727442169155270e-02)::float8 - ((-3.65315727442169155270e-02)::float8 * 134217729 - ((-3.65315727442169155270e-02)::float8 * 134217729 - (-3.65315727442169155270e-02)::float8))));
      f_s := (-5.83357013379057348645e-02)::float8 + f_p;
      f_tl := ((-5.83357013379057348645e-02)::float8 - (f_s - (f_s - (-5.83357013379057348645e-02)::float8))) + (f_p - (f_s - (-5.83357013379057348645e-02)::float8));
      f_w := (f_tl - ((f_tl + f_e) - ((f_tl + f_e) - f_tl))) + (f_e - ((f_tl + f_e) - f_tl));
      a_s2 := f_s + (f_tl + f_e);
      if f_w <> 0 and ((f_s - (a_s2 - (a_s2 - f_s))) + ((f_tl + f_e) - (a_s2 - f_s))) <> 0 and (a_s2 + 2 * ((f_s - (a_s2 - (a_s2 - f_s))) + ((f_tl + f_e) - (a_s2 - f_s)))) - a_s2 = 2 * ((f_s - (a_s2 - (a_s2 - f_s))) + ((f_tl + f_e) - (a_s2 - f_s))) and (f_w < 0) = (((f_s - (a_s2 - (a_s2 - f_s))) + ((f_tl + f_e) - (a_s2 - f_s))) < 0) then a_s2 := a_s2 + 2 * ((f_s - (a_s2 - (a_s2 - f_s))) + ((f_tl + f_e) - (a_s2 - f_s))); end if;
    elsif a_w = 0 or (-3.65315727442169155270e-02)::float8 = 0 then
      a_s2 := a_w * (-3.65315727442169155270e-02)::float8 + (-5.83357013379057348645e-02)::float8;
    else
      a_s2 := fdlibm_fma_wide(a => a_w, b => (-3.65315727442169155270e-02)::float8, c => (-5.83357013379057348645e-02)::float8);
    end if;
    if abs(a_w) >= 1e-144 and abs(a_w) <= 1e144 and abs(a_s2) >= 1e-144 and abs(a_s2) <= 1e144 and abs((-7.69187620504482999495e-02)::float8) <= 1e288 then
      f_p := a_w * a_s2;
      f_ah := (a_w * 134217729 - (a_w * 134217729 - a_w));
      f_bh := (a_s2 * 134217729 - (a_s2 * 134217729 - a_s2));
      f_e := (a_w - f_ah) * (a_s2 - f_bh) - (((f_p - f_ah * f_bh) - (a_w - f_ah) * f_bh) - f_ah * (a_s2 - f_bh));
      f_s := (-7.69187620504482999495e-02)::float8 + f_p;
      f_tl := ((-7.69187620504482999495e-02)::float8 - (f_s - (f_s - (-7.69187620504482999495e-02)::float8))) + (f_p - (f_s - (-7.69187620504482999495e-02)::float8));
      f_w := (f_tl - ((f_tl + f_e) - ((f_tl + f_e) - f_tl))) + (f_e - ((f_tl + f_e) - f_tl));
      a_s2 := f_s + (f_tl + f_e);
      if f_w <> 0 and ((f_s - (a_s2 - (a_s2 - f_s))) + ((f_tl + f_e) - (a_s2 - f_s))) <> 0 and (a_s2 + 2 * ((f_s - (a_s2 - (a_s2 - f_s))) + ((f_tl + f_e) - (a_s2 - f_s)))) - a_s2 = 2 * ((f_s - (a_s2 - (a_s2 - f_s))) + ((f_tl + f_e) - (a_s2 - f_s))) and (f_w < 0) = (((f_s - (a_s2 - (a_s2 - f_s))) + ((f_tl + f_e) - (a_s2 - f_s))) < 0) then a_s2 := a_s2 + 2 * ((f_s - (a_s2 - (a_s2 - f_s))) + ((f_tl + f_e) - (a_s2 - f_s))); end if;
    elsif a_w = 0 or a_s2 = 0 then
      a_s2 := a_w * a_s2 + (-7.69187620504482999495e-02)::float8;
    else
      a_s2 := fdlibm_fma_wide(a => a_w, b => a_s2, c => (-7.69187620504482999495e-02)::float8);
    end if;
    if abs(a_w) >= 1e-144 and abs(a_w) <= 1e144 and abs(a_s2) >= 1e-144 and abs(a_s2) <= 1e144 and abs((-1.11111104054623557880e-01)::float8) <= 1e288 then
      f_p := a_w * a_s2;
      f_ah := (a_w * 134217729 - (a_w * 134217729 - a_w));
      f_bh := (a_s2 * 134217729 - (a_s2 * 134217729 - a_s2));
      f_e := (a_w - f_ah) * (a_s2 - f_bh) - (((f_p - f_ah * f_bh) - (a_w - f_ah) * f_bh) - f_ah * (a_s2 - f_bh));
      f_s := (-1.11111104054623557880e-01)::float8 + f_p;
      f_tl := ((-1.11111104054623557880e-01)::float8 - (f_s - (f_s - (-1.11111104054623557880e-01)::float8))) + (f_p - (f_s - (-1.11111104054623557880e-01)::float8));
      f_w := (f_tl - ((f_tl + f_e) - ((f_tl + f_e) - f_tl))) + (f_e - ((f_tl + f_e) - f_tl));
      a_s2 := f_s + (f_tl + f_e);
      if f_w <> 0 and ((f_s - (a_s2 - (a_s2 - f_s))) + ((f_tl + f_e) - (a_s2 - f_s))) <> 0 and (a_s2 + 2 * ((f_s - (a_s2 - (a_s2 - f_s))) + ((f_tl + f_e) - (a_s2 - f_s)))) - a_s2 = 2 * ((f_s - (a_s2 - (a_s2 - f_s))) + ((f_tl + f_e) - (a_s2 - f_s))) and (f_w < 0) = (((f_s - (a_s2 - (a_s2 - f_s))) + ((f_tl + f_e) - (a_s2 - f_s))) < 0) then a_s2 := a_s2 + 2 * ((f_s - (a_s2 - (a_s2 - f_s))) + ((f_tl + f_e) - (a_s2 - f_s))); end if;
    elsif a_w = 0 or a_s2 = 0 then
      a_s2 := a_w * a_s2 + (-1.11111104054623557880e-01)::float8;
    else
      a_s2 := fdlibm_fma_wide(a => a_w, b => a_s2, c => (-1.11111104054623557880e-01)::float8);
    end if;
    if abs(a_w) >= 1e-144 and abs(a_w) <= 1e144 and abs(a_s2) >= 1e-144 and abs(a_s2) <= 1e144 and abs((-1.99999999998764832476e-01)::float8) <= 1e288 then
      f_p := a_w * a_s2;
      f_ah := (a_w * 134217729 - (a_w * 134217729 - a_w));
      f_bh := (a_s2 * 134217729 - (a_s2 * 134217729 - a_s2));
      f_e := (a_w - f_ah) * (a_s2 - f_bh) - (((f_p - f_ah * f_bh) - (a_w - f_ah) * f_bh) - f_ah * (a_s2 - f_bh));
      f_s := (-1.99999999998764832476e-01)::float8 + f_p;
      f_tl := ((-1.99999999998764832476e-01)::float8 - (f_s - (f_s - (-1.99999999998764832476e-01)::float8))) + (f_p - (f_s - (-1.99999999998764832476e-01)::float8));
      f_w := (f_tl - ((f_tl + f_e) - ((f_tl + f_e) - f_tl))) + (f_e - ((f_tl + f_e) - f_tl));
      a_s2 := f_s + (f_tl + f_e);
      if f_w <> 0 and ((f_s - (a_s2 - (a_s2 - f_s))) + ((f_tl + f_e) - (a_s2 - f_s))) <> 0 and (a_s2 + 2 * ((f_s - (a_s2 - (a_s2 - f_s))) + ((f_tl + f_e) - (a_s2 - f_s)))) - a_s2 = 2 * ((f_s - (a_s2 - (a_s2 - f_s))) + ((f_tl + f_e) - (a_s2 - f_s))) and (f_w < 0) = (((f_s - (a_s2 - (a_s2 - f_s))) + ((f_tl + f_e) - (a_s2 - f_s))) < 0) then a_s2 := a_s2 + 2 * ((f_s - (a_s2 - (a_s2 - f_s))) + ((f_tl + f_e) - (a_s2 - f_s))); end if;
    elsif a_w = 0 or a_s2 = 0 then
      a_s2 := a_w * a_s2 + (-1.99999999998764832476e-01)::float8;
    else
      a_s2 := fdlibm_fma_wide(a => a_w, b => a_s2, c => (-1.99999999998764832476e-01)::float8);
    end if;
    a_s2 := a_w * a_s2;
    if a_id < 0 then
      f_b := a_s1 + a_s2;
      if abs(-a_x) >= 1e-144 and abs(-a_x) <= 1e144 and abs(f_b) >= 1e-144 and abs(f_b) <= 1e144 and abs(a_x) <= 1e288 then
        f_p := -a_x * f_b;
        f_ah := (-a_x * 134217729 - (-a_x * 134217729 - -a_x));
        f_bh := (f_b * 134217729 - (f_b * 134217729 - f_b));
        f_e := (-a_x - f_ah) * (f_b - f_bh) - (((f_p - f_ah * f_bh) - (-a_x - f_ah) * f_bh) - f_ah * (f_b - f_bh));
        f_s := a_x + f_p;
        f_tl := (a_x - (f_s - (f_s - a_x))) + (f_p - (f_s - a_x));
        f_w := (f_tl - ((f_tl + f_e) - ((f_tl + f_e) - f_tl))) + (f_e - ((f_tl + f_e) - f_tl));
        a_u := f_s + (f_tl + f_e);
        if f_w <> 0 and ((f_s - (a_u - (a_u - f_s))) + ((f_tl + f_e) - (a_u - f_s))) <> 0 and (a_u + 2 * ((f_s - (a_u - (a_u - f_s))) + ((f_tl + f_e) - (a_u - f_s)))) - a_u = 2 * ((f_s - (a_u - (a_u - f_s))) + ((f_tl + f_e) - (a_u - f_s))) and (f_w < 0) = (((f_s - (a_u - (a_u - f_s))) + ((f_tl + f_e) - (a_u - f_s))) < 0) then a_u := a_u + 2 * ((f_s - (a_u - (a_u - f_s))) + ((f_tl + f_e) - (a_u - f_s))); end if;
      elsif -a_x = 0 or f_b = 0 then
        a_u := -a_x * f_b + a_x;
      else
        a_u := fdlibm_fma_wide(a => -a_x, b => f_b, c => a_x);
      end if;
      z := a_u; exit;
    end if;
    f_b := a_s1 + a_s2;
    f_c := -case a_id when 0 then 2.26987774529616870924e-17 when 1 then 3.06161699786838301793e-17 when 2 then 1.39033110312309984516e-17 else 6.12323399573676603587e-17 end;
    if abs(a_x) >= 1e-144 and abs(a_x) <= 1e144 and abs(f_b) >= 1e-144 and abs(f_b) <= 1e144 and abs(f_c) <= 1e288 then
      f_p := a_x * f_b;
      f_ah := (a_x * 134217729 - (a_x * 134217729 - a_x));
      f_bh := (f_b * 134217729 - (f_b * 134217729 - f_b));
      f_e := (a_x - f_ah) * (f_b - f_bh) - (((f_p - f_ah * f_bh) - (a_x - f_ah) * f_bh) - f_ah * (f_b - f_bh));
      f_s := f_c + f_p;
      f_tl := (f_c - (f_s - (f_s - f_c))) + (f_p - (f_s - f_c));
      f_w := (f_tl - ((f_tl + f_e) - ((f_tl + f_e) - f_tl))) + (f_e - ((f_tl + f_e) - f_tl));
      a_u := f_s + (f_tl + f_e);
      if f_w <> 0 and ((f_s - (a_u - (a_u - f_s))) + ((f_tl + f_e) - (a_u - f_s))) <> 0 and (a_u + 2 * ((f_s - (a_u - (a_u - f_s))) + ((f_tl + f_e) - (a_u - f_s)))) - a_u = 2 * ((f_s - (a_u - (a_u - f_s))) + ((f_tl + f_e) - (a_u - f_s))) and (f_w < 0) = (((f_s - (a_u - (a_u - f_s))) + ((f_tl + f_e) - (a_u - f_s))) < 0) then a_u := a_u + 2 * ((f_s - (a_u - (a_u - f_s))) + ((f_tl + f_e) - (a_u - f_s))); end if;
    elsif a_x = 0 or f_b = 0 then
      a_u := a_x * f_b + f_c;
    else
      a_u := fdlibm_fma_wide(a => a_x, b => f_b, c => f_c);
    end if;
    a_z := case a_id when 0 then 4.63647609000806093515e-01 when 1 then 7.85398163397448278999e-01
      when 2 then 9.82793723247329054082e-01 else 1.57079632679489655800e+00 end - (a_u - a_x);
    z := case when a_hx < 0 then -a_z else a_z end; exit;
  end loop;

  else
    z := abs(y / x);
  loop
    a_x := z;
    a_hx := (int8(float8send(a_x)) >> 32)::int;
    a_ix := a_hx & 2147483647;
    if a_ix >= 0x44100000 then
      if a_ix > 0x7FF00000 or (a_ix = 0x7FF00000 and (int8(float8send(a_x)) & 4294967295) <> 0) then z := a_x; exit; end if;
      if a_hx > 0 then z := 1.57079632679489655800e+00::float8 + 6.12323399573676603587e-17::float8; exit; end if;
      z := -1.57079632679489655800e+00::float8 - 6.12323399573676603587e-17::float8; exit;
    end if;
    if a_ix < 0x3FDC0000 then
      if a_ix < 0x3E400000 then z := a_x; exit; end if;
      a_id := -1;
    else
      a_x := abs(a_x);
      if a_ix < 0x3FF30000 then
        if a_ix < 0x3FE60000 then
          a_id := 0;
          a_x := (2 * a_x - 1) / (2 + a_x);
        else
          a_id := 1;
          a_x := (a_x - 1) / (a_x + 1);
        end if;
      elsif a_ix < 0x40038000 then
        a_id := 2;
        if abs((1.5)::float8) >= 1e-144 and abs((1.5)::float8) <= 1e144 and abs(a_x) >= 1e-144 and abs(a_x) <= 1e144 and abs((1)::float8) <= 1e288 then
          f_p := (1.5)::float8 * a_x;
          f_bh := (a_x * 134217729 - (a_x * 134217729 - a_x));
          f_e := ((1.5)::float8 - ((1.5)::float8 * 134217729 - ((1.5)::float8 * 134217729 - (1.5)::float8))) * (a_x - f_bh) - (((f_p - ((1.5)::float8 * 134217729 - ((1.5)::float8 * 134217729 - (1.5)::float8)) * f_bh) - ((1.5)::float8 - ((1.5)::float8 * 134217729 - ((1.5)::float8 * 134217729 - (1.5)::float8))) * f_bh) - ((1.5)::float8 * 134217729 - ((1.5)::float8 * 134217729 - (1.5)::float8)) * (a_x - f_bh));
          f_s := (1)::float8 + f_p;
          f_tl := ((1)::float8 - (f_s - (f_s - (1)::float8))) + (f_p - (f_s - (1)::float8));
          f_w := (f_tl - ((f_tl + f_e) - ((f_tl + f_e) - f_tl))) + (f_e - ((f_tl + f_e) - f_tl));
          a_u := f_s + (f_tl + f_e);
          if f_w <> 0 and ((f_s - (a_u - (a_u - f_s))) + ((f_tl + f_e) - (a_u - f_s))) <> 0 and (a_u + 2 * ((f_s - (a_u - (a_u - f_s))) + ((f_tl + f_e) - (a_u - f_s)))) - a_u = 2 * ((f_s - (a_u - (a_u - f_s))) + ((f_tl + f_e) - (a_u - f_s))) and (f_w < 0) = (((f_s - (a_u - (a_u - f_s))) + ((f_tl + f_e) - (a_u - f_s))) < 0) then a_u := a_u + 2 * ((f_s - (a_u - (a_u - f_s))) + ((f_tl + f_e) - (a_u - f_s))); end if;
        elsif (1.5)::float8 = 0 or a_x = 0 then
          a_u := (1.5)::float8 * a_x + (1)::float8;
        else
          a_u := fdlibm_fma_wide(a => (1.5)::float8, b => a_x, c => (1)::float8);
        end if;
        a_x := (a_x - 1.5) / a_u;
      else
        a_id := 3;
        a_x := -1 / a_x;
      end if;
    end if;
    a_z := a_x * a_x;
    a_w := a_z * a_z;
    if abs(a_w) >= 1e-144 and abs(a_w) <= 1e144 and abs((1.62858201153657823623e-02)::float8) >= 1e-144 and abs((1.62858201153657823623e-02)::float8) <= 1e144 and abs((4.97687799461593236017e-02)::float8) <= 1e288 then
      f_p := a_w * (1.62858201153657823623e-02)::float8;
      f_ah := (a_w * 134217729 - (a_w * 134217729 - a_w));
      f_e := (a_w - f_ah) * ((1.62858201153657823623e-02)::float8 - ((1.62858201153657823623e-02)::float8 * 134217729 - ((1.62858201153657823623e-02)::float8 * 134217729 - (1.62858201153657823623e-02)::float8))) - (((f_p - f_ah * ((1.62858201153657823623e-02)::float8 * 134217729 - ((1.62858201153657823623e-02)::float8 * 134217729 - (1.62858201153657823623e-02)::float8))) - (a_w - f_ah) * ((1.62858201153657823623e-02)::float8 * 134217729 - ((1.62858201153657823623e-02)::float8 * 134217729 - (1.62858201153657823623e-02)::float8))) - f_ah * ((1.62858201153657823623e-02)::float8 - ((1.62858201153657823623e-02)::float8 * 134217729 - ((1.62858201153657823623e-02)::float8 * 134217729 - (1.62858201153657823623e-02)::float8))));
      f_s := (4.97687799461593236017e-02)::float8 + f_p;
      f_tl := ((4.97687799461593236017e-02)::float8 - (f_s - (f_s - (4.97687799461593236017e-02)::float8))) + (f_p - (f_s - (4.97687799461593236017e-02)::float8));
      f_w := (f_tl - ((f_tl + f_e) - ((f_tl + f_e) - f_tl))) + (f_e - ((f_tl + f_e) - f_tl));
      a_s1 := f_s + (f_tl + f_e);
      if f_w <> 0 and ((f_s - (a_s1 - (a_s1 - f_s))) + ((f_tl + f_e) - (a_s1 - f_s))) <> 0 and (a_s1 + 2 * ((f_s - (a_s1 - (a_s1 - f_s))) + ((f_tl + f_e) - (a_s1 - f_s)))) - a_s1 = 2 * ((f_s - (a_s1 - (a_s1 - f_s))) + ((f_tl + f_e) - (a_s1 - f_s))) and (f_w < 0) = (((f_s - (a_s1 - (a_s1 - f_s))) + ((f_tl + f_e) - (a_s1 - f_s))) < 0) then a_s1 := a_s1 + 2 * ((f_s - (a_s1 - (a_s1 - f_s))) + ((f_tl + f_e) - (a_s1 - f_s))); end if;
    elsif a_w = 0 or (1.62858201153657823623e-02)::float8 = 0 then
      a_s1 := a_w * (1.62858201153657823623e-02)::float8 + (4.97687799461593236017e-02)::float8;
    else
      a_s1 := fdlibm_fma_wide(a => a_w, b => (1.62858201153657823623e-02)::float8, c => (4.97687799461593236017e-02)::float8);
    end if;
    if abs(a_w) >= 1e-144 and abs(a_w) <= 1e144 and abs(a_s1) >= 1e-144 and abs(a_s1) <= 1e144 and abs((6.66107313738753120669e-02)::float8) <= 1e288 then
      f_p := a_w * a_s1;
      f_ah := (a_w * 134217729 - (a_w * 134217729 - a_w));
      f_bh := (a_s1 * 134217729 - (a_s1 * 134217729 - a_s1));
      f_e := (a_w - f_ah) * (a_s1 - f_bh) - (((f_p - f_ah * f_bh) - (a_w - f_ah) * f_bh) - f_ah * (a_s1 - f_bh));
      f_s := (6.66107313738753120669e-02)::float8 + f_p;
      f_tl := ((6.66107313738753120669e-02)::float8 - (f_s - (f_s - (6.66107313738753120669e-02)::float8))) + (f_p - (f_s - (6.66107313738753120669e-02)::float8));
      f_w := (f_tl - ((f_tl + f_e) - ((f_tl + f_e) - f_tl))) + (f_e - ((f_tl + f_e) - f_tl));
      a_s1 := f_s + (f_tl + f_e);
      if f_w <> 0 and ((f_s - (a_s1 - (a_s1 - f_s))) + ((f_tl + f_e) - (a_s1 - f_s))) <> 0 and (a_s1 + 2 * ((f_s - (a_s1 - (a_s1 - f_s))) + ((f_tl + f_e) - (a_s1 - f_s)))) - a_s1 = 2 * ((f_s - (a_s1 - (a_s1 - f_s))) + ((f_tl + f_e) - (a_s1 - f_s))) and (f_w < 0) = (((f_s - (a_s1 - (a_s1 - f_s))) + ((f_tl + f_e) - (a_s1 - f_s))) < 0) then a_s1 := a_s1 + 2 * ((f_s - (a_s1 - (a_s1 - f_s))) + ((f_tl + f_e) - (a_s1 - f_s))); end if;
    elsif a_w = 0 or a_s1 = 0 then
      a_s1 := a_w * a_s1 + (6.66107313738753120669e-02)::float8;
    else
      a_s1 := fdlibm_fma_wide(a => a_w, b => a_s1, c => (6.66107313738753120669e-02)::float8);
    end if;
    if abs(a_w) >= 1e-144 and abs(a_w) <= 1e144 and abs(a_s1) >= 1e-144 and abs(a_s1) <= 1e144 and abs((9.09088713343650656196e-02)::float8) <= 1e288 then
      f_p := a_w * a_s1;
      f_ah := (a_w * 134217729 - (a_w * 134217729 - a_w));
      f_bh := (a_s1 * 134217729 - (a_s1 * 134217729 - a_s1));
      f_e := (a_w - f_ah) * (a_s1 - f_bh) - (((f_p - f_ah * f_bh) - (a_w - f_ah) * f_bh) - f_ah * (a_s1 - f_bh));
      f_s := (9.09088713343650656196e-02)::float8 + f_p;
      f_tl := ((9.09088713343650656196e-02)::float8 - (f_s - (f_s - (9.09088713343650656196e-02)::float8))) + (f_p - (f_s - (9.09088713343650656196e-02)::float8));
      f_w := (f_tl - ((f_tl + f_e) - ((f_tl + f_e) - f_tl))) + (f_e - ((f_tl + f_e) - f_tl));
      a_s1 := f_s + (f_tl + f_e);
      if f_w <> 0 and ((f_s - (a_s1 - (a_s1 - f_s))) + ((f_tl + f_e) - (a_s1 - f_s))) <> 0 and (a_s1 + 2 * ((f_s - (a_s1 - (a_s1 - f_s))) + ((f_tl + f_e) - (a_s1 - f_s)))) - a_s1 = 2 * ((f_s - (a_s1 - (a_s1 - f_s))) + ((f_tl + f_e) - (a_s1 - f_s))) and (f_w < 0) = (((f_s - (a_s1 - (a_s1 - f_s))) + ((f_tl + f_e) - (a_s1 - f_s))) < 0) then a_s1 := a_s1 + 2 * ((f_s - (a_s1 - (a_s1 - f_s))) + ((f_tl + f_e) - (a_s1 - f_s))); end if;
    elsif a_w = 0 or a_s1 = 0 then
      a_s1 := a_w * a_s1 + (9.09088713343650656196e-02)::float8;
    else
      a_s1 := fdlibm_fma_wide(a => a_w, b => a_s1, c => (9.09088713343650656196e-02)::float8);
    end if;
    if abs(a_w) >= 1e-144 and abs(a_w) <= 1e144 and abs(a_s1) >= 1e-144 and abs(a_s1) <= 1e144 and abs((1.42857142725034663711e-01)::float8) <= 1e288 then
      f_p := a_w * a_s1;
      f_ah := (a_w * 134217729 - (a_w * 134217729 - a_w));
      f_bh := (a_s1 * 134217729 - (a_s1 * 134217729 - a_s1));
      f_e := (a_w - f_ah) * (a_s1 - f_bh) - (((f_p - f_ah * f_bh) - (a_w - f_ah) * f_bh) - f_ah * (a_s1 - f_bh));
      f_s := (1.42857142725034663711e-01)::float8 + f_p;
      f_tl := ((1.42857142725034663711e-01)::float8 - (f_s - (f_s - (1.42857142725034663711e-01)::float8))) + (f_p - (f_s - (1.42857142725034663711e-01)::float8));
      f_w := (f_tl - ((f_tl + f_e) - ((f_tl + f_e) - f_tl))) + (f_e - ((f_tl + f_e) - f_tl));
      a_s1 := f_s + (f_tl + f_e);
      if f_w <> 0 and ((f_s - (a_s1 - (a_s1 - f_s))) + ((f_tl + f_e) - (a_s1 - f_s))) <> 0 and (a_s1 + 2 * ((f_s - (a_s1 - (a_s1 - f_s))) + ((f_tl + f_e) - (a_s1 - f_s)))) - a_s1 = 2 * ((f_s - (a_s1 - (a_s1 - f_s))) + ((f_tl + f_e) - (a_s1 - f_s))) and (f_w < 0) = (((f_s - (a_s1 - (a_s1 - f_s))) + ((f_tl + f_e) - (a_s1 - f_s))) < 0) then a_s1 := a_s1 + 2 * ((f_s - (a_s1 - (a_s1 - f_s))) + ((f_tl + f_e) - (a_s1 - f_s))); end if;
    elsif a_w = 0 or a_s1 = 0 then
      a_s1 := a_w * a_s1 + (1.42857142725034663711e-01)::float8;
    else
      a_s1 := fdlibm_fma_wide(a => a_w, b => a_s1, c => (1.42857142725034663711e-01)::float8);
    end if;
    if abs(a_w) >= 1e-144 and abs(a_w) <= 1e144 and abs(a_s1) >= 1e-144 and abs(a_s1) <= 1e144 and abs((3.33333333333329318027e-01)::float8) <= 1e288 then
      f_p := a_w * a_s1;
      f_ah := (a_w * 134217729 - (a_w * 134217729 - a_w));
      f_bh := (a_s1 * 134217729 - (a_s1 * 134217729 - a_s1));
      f_e := (a_w - f_ah) * (a_s1 - f_bh) - (((f_p - f_ah * f_bh) - (a_w - f_ah) * f_bh) - f_ah * (a_s1 - f_bh));
      f_s := (3.33333333333329318027e-01)::float8 + f_p;
      f_tl := ((3.33333333333329318027e-01)::float8 - (f_s - (f_s - (3.33333333333329318027e-01)::float8))) + (f_p - (f_s - (3.33333333333329318027e-01)::float8));
      f_w := (f_tl - ((f_tl + f_e) - ((f_tl + f_e) - f_tl))) + (f_e - ((f_tl + f_e) - f_tl));
      a_s1 := f_s + (f_tl + f_e);
      if f_w <> 0 and ((f_s - (a_s1 - (a_s1 - f_s))) + ((f_tl + f_e) - (a_s1 - f_s))) <> 0 and (a_s1 + 2 * ((f_s - (a_s1 - (a_s1 - f_s))) + ((f_tl + f_e) - (a_s1 - f_s)))) - a_s1 = 2 * ((f_s - (a_s1 - (a_s1 - f_s))) + ((f_tl + f_e) - (a_s1 - f_s))) and (f_w < 0) = (((f_s - (a_s1 - (a_s1 - f_s))) + ((f_tl + f_e) - (a_s1 - f_s))) < 0) then a_s1 := a_s1 + 2 * ((f_s - (a_s1 - (a_s1 - f_s))) + ((f_tl + f_e) - (a_s1 - f_s))); end if;
    elsif a_w = 0 or a_s1 = 0 then
      a_s1 := a_w * a_s1 + (3.33333333333329318027e-01)::float8;
    else
      a_s1 := fdlibm_fma_wide(a => a_w, b => a_s1, c => (3.33333333333329318027e-01)::float8);
    end if;
    a_s1 := a_z * a_s1;
    if abs(a_w) >= 1e-144 and abs(a_w) <= 1e144 and abs((-3.65315727442169155270e-02)::float8) >= 1e-144 and abs((-3.65315727442169155270e-02)::float8) <= 1e144 and abs((-5.83357013379057348645e-02)::float8) <= 1e288 then
      f_p := a_w * (-3.65315727442169155270e-02)::float8;
      f_ah := (a_w * 134217729 - (a_w * 134217729 - a_w));
      f_e := (a_w - f_ah) * ((-3.65315727442169155270e-02)::float8 - ((-3.65315727442169155270e-02)::float8 * 134217729 - ((-3.65315727442169155270e-02)::float8 * 134217729 - (-3.65315727442169155270e-02)::float8))) - (((f_p - f_ah * ((-3.65315727442169155270e-02)::float8 * 134217729 - ((-3.65315727442169155270e-02)::float8 * 134217729 - (-3.65315727442169155270e-02)::float8))) - (a_w - f_ah) * ((-3.65315727442169155270e-02)::float8 * 134217729 - ((-3.65315727442169155270e-02)::float8 * 134217729 - (-3.65315727442169155270e-02)::float8))) - f_ah * ((-3.65315727442169155270e-02)::float8 - ((-3.65315727442169155270e-02)::float8 * 134217729 - ((-3.65315727442169155270e-02)::float8 * 134217729 - (-3.65315727442169155270e-02)::float8))));
      f_s := (-5.83357013379057348645e-02)::float8 + f_p;
      f_tl := ((-5.83357013379057348645e-02)::float8 - (f_s - (f_s - (-5.83357013379057348645e-02)::float8))) + (f_p - (f_s - (-5.83357013379057348645e-02)::float8));
      f_w := (f_tl - ((f_tl + f_e) - ((f_tl + f_e) - f_tl))) + (f_e - ((f_tl + f_e) - f_tl));
      a_s2 := f_s + (f_tl + f_e);
      if f_w <> 0 and ((f_s - (a_s2 - (a_s2 - f_s))) + ((f_tl + f_e) - (a_s2 - f_s))) <> 0 and (a_s2 + 2 * ((f_s - (a_s2 - (a_s2 - f_s))) + ((f_tl + f_e) - (a_s2 - f_s)))) - a_s2 = 2 * ((f_s - (a_s2 - (a_s2 - f_s))) + ((f_tl + f_e) - (a_s2 - f_s))) and (f_w < 0) = (((f_s - (a_s2 - (a_s2 - f_s))) + ((f_tl + f_e) - (a_s2 - f_s))) < 0) then a_s2 := a_s2 + 2 * ((f_s - (a_s2 - (a_s2 - f_s))) + ((f_tl + f_e) - (a_s2 - f_s))); end if;
    elsif a_w = 0 or (-3.65315727442169155270e-02)::float8 = 0 then
      a_s2 := a_w * (-3.65315727442169155270e-02)::float8 + (-5.83357013379057348645e-02)::float8;
    else
      a_s2 := fdlibm_fma_wide(a => a_w, b => (-3.65315727442169155270e-02)::float8, c => (-5.83357013379057348645e-02)::float8);
    end if;
    if abs(a_w) >= 1e-144 and abs(a_w) <= 1e144 and abs(a_s2) >= 1e-144 and abs(a_s2) <= 1e144 and abs((-7.69187620504482999495e-02)::float8) <= 1e288 then
      f_p := a_w * a_s2;
      f_ah := (a_w * 134217729 - (a_w * 134217729 - a_w));
      f_bh := (a_s2 * 134217729 - (a_s2 * 134217729 - a_s2));
      f_e := (a_w - f_ah) * (a_s2 - f_bh) - (((f_p - f_ah * f_bh) - (a_w - f_ah) * f_bh) - f_ah * (a_s2 - f_bh));
      f_s := (-7.69187620504482999495e-02)::float8 + f_p;
      f_tl := ((-7.69187620504482999495e-02)::float8 - (f_s - (f_s - (-7.69187620504482999495e-02)::float8))) + (f_p - (f_s - (-7.69187620504482999495e-02)::float8));
      f_w := (f_tl - ((f_tl + f_e) - ((f_tl + f_e) - f_tl))) + (f_e - ((f_tl + f_e) - f_tl));
      a_s2 := f_s + (f_tl + f_e);
      if f_w <> 0 and ((f_s - (a_s2 - (a_s2 - f_s))) + ((f_tl + f_e) - (a_s2 - f_s))) <> 0 and (a_s2 + 2 * ((f_s - (a_s2 - (a_s2 - f_s))) + ((f_tl + f_e) - (a_s2 - f_s)))) - a_s2 = 2 * ((f_s - (a_s2 - (a_s2 - f_s))) + ((f_tl + f_e) - (a_s2 - f_s))) and (f_w < 0) = (((f_s - (a_s2 - (a_s2 - f_s))) + ((f_tl + f_e) - (a_s2 - f_s))) < 0) then a_s2 := a_s2 + 2 * ((f_s - (a_s2 - (a_s2 - f_s))) + ((f_tl + f_e) - (a_s2 - f_s))); end if;
    elsif a_w = 0 or a_s2 = 0 then
      a_s2 := a_w * a_s2 + (-7.69187620504482999495e-02)::float8;
    else
      a_s2 := fdlibm_fma_wide(a => a_w, b => a_s2, c => (-7.69187620504482999495e-02)::float8);
    end if;
    if abs(a_w) >= 1e-144 and abs(a_w) <= 1e144 and abs(a_s2) >= 1e-144 and abs(a_s2) <= 1e144 and abs((-1.11111104054623557880e-01)::float8) <= 1e288 then
      f_p := a_w * a_s2;
      f_ah := (a_w * 134217729 - (a_w * 134217729 - a_w));
      f_bh := (a_s2 * 134217729 - (a_s2 * 134217729 - a_s2));
      f_e := (a_w - f_ah) * (a_s2 - f_bh) - (((f_p - f_ah * f_bh) - (a_w - f_ah) * f_bh) - f_ah * (a_s2 - f_bh));
      f_s := (-1.11111104054623557880e-01)::float8 + f_p;
      f_tl := ((-1.11111104054623557880e-01)::float8 - (f_s - (f_s - (-1.11111104054623557880e-01)::float8))) + (f_p - (f_s - (-1.11111104054623557880e-01)::float8));
      f_w := (f_tl - ((f_tl + f_e) - ((f_tl + f_e) - f_tl))) + (f_e - ((f_tl + f_e) - f_tl));
      a_s2 := f_s + (f_tl + f_e);
      if f_w <> 0 and ((f_s - (a_s2 - (a_s2 - f_s))) + ((f_tl + f_e) - (a_s2 - f_s))) <> 0 and (a_s2 + 2 * ((f_s - (a_s2 - (a_s2 - f_s))) + ((f_tl + f_e) - (a_s2 - f_s)))) - a_s2 = 2 * ((f_s - (a_s2 - (a_s2 - f_s))) + ((f_tl + f_e) - (a_s2 - f_s))) and (f_w < 0) = (((f_s - (a_s2 - (a_s2 - f_s))) + ((f_tl + f_e) - (a_s2 - f_s))) < 0) then a_s2 := a_s2 + 2 * ((f_s - (a_s2 - (a_s2 - f_s))) + ((f_tl + f_e) - (a_s2 - f_s))); end if;
    elsif a_w = 0 or a_s2 = 0 then
      a_s2 := a_w * a_s2 + (-1.11111104054623557880e-01)::float8;
    else
      a_s2 := fdlibm_fma_wide(a => a_w, b => a_s2, c => (-1.11111104054623557880e-01)::float8);
    end if;
    if abs(a_w) >= 1e-144 and abs(a_w) <= 1e144 and abs(a_s2) >= 1e-144 and abs(a_s2) <= 1e144 and abs((-1.99999999998764832476e-01)::float8) <= 1e288 then
      f_p := a_w * a_s2;
      f_ah := (a_w * 134217729 - (a_w * 134217729 - a_w));
      f_bh := (a_s2 * 134217729 - (a_s2 * 134217729 - a_s2));
      f_e := (a_w - f_ah) * (a_s2 - f_bh) - (((f_p - f_ah * f_bh) - (a_w - f_ah) * f_bh) - f_ah * (a_s2 - f_bh));
      f_s := (-1.99999999998764832476e-01)::float8 + f_p;
      f_tl := ((-1.99999999998764832476e-01)::float8 - (f_s - (f_s - (-1.99999999998764832476e-01)::float8))) + (f_p - (f_s - (-1.99999999998764832476e-01)::float8));
      f_w := (f_tl - ((f_tl + f_e) - ((f_tl + f_e) - f_tl))) + (f_e - ((f_tl + f_e) - f_tl));
      a_s2 := f_s + (f_tl + f_e);
      if f_w <> 0 and ((f_s - (a_s2 - (a_s2 - f_s))) + ((f_tl + f_e) - (a_s2 - f_s))) <> 0 and (a_s2 + 2 * ((f_s - (a_s2 - (a_s2 - f_s))) + ((f_tl + f_e) - (a_s2 - f_s)))) - a_s2 = 2 * ((f_s - (a_s2 - (a_s2 - f_s))) + ((f_tl + f_e) - (a_s2 - f_s))) and (f_w < 0) = (((f_s - (a_s2 - (a_s2 - f_s))) + ((f_tl + f_e) - (a_s2 - f_s))) < 0) then a_s2 := a_s2 + 2 * ((f_s - (a_s2 - (a_s2 - f_s))) + ((f_tl + f_e) - (a_s2 - f_s))); end if;
    elsif a_w = 0 or a_s2 = 0 then
      a_s2 := a_w * a_s2 + (-1.99999999998764832476e-01)::float8;
    else
      a_s2 := fdlibm_fma_wide(a => a_w, b => a_s2, c => (-1.99999999998764832476e-01)::float8);
    end if;
    a_s2 := a_w * a_s2;
    if a_id < 0 then
      f_b := a_s1 + a_s2;
      if abs(-a_x) >= 1e-144 and abs(-a_x) <= 1e144 and abs(f_b) >= 1e-144 and abs(f_b) <= 1e144 and abs(a_x) <= 1e288 then
        f_p := -a_x * f_b;
        f_ah := (-a_x * 134217729 - (-a_x * 134217729 - -a_x));
        f_bh := (f_b * 134217729 - (f_b * 134217729 - f_b));
        f_e := (-a_x - f_ah) * (f_b - f_bh) - (((f_p - f_ah * f_bh) - (-a_x - f_ah) * f_bh) - f_ah * (f_b - f_bh));
        f_s := a_x + f_p;
        f_tl := (a_x - (f_s - (f_s - a_x))) + (f_p - (f_s - a_x));
        f_w := (f_tl - ((f_tl + f_e) - ((f_tl + f_e) - f_tl))) + (f_e - ((f_tl + f_e) - f_tl));
        a_u := f_s + (f_tl + f_e);
        if f_w <> 0 and ((f_s - (a_u - (a_u - f_s))) + ((f_tl + f_e) - (a_u - f_s))) <> 0 and (a_u + 2 * ((f_s - (a_u - (a_u - f_s))) + ((f_tl + f_e) - (a_u - f_s)))) - a_u = 2 * ((f_s - (a_u - (a_u - f_s))) + ((f_tl + f_e) - (a_u - f_s))) and (f_w < 0) = (((f_s - (a_u - (a_u - f_s))) + ((f_tl + f_e) - (a_u - f_s))) < 0) then a_u := a_u + 2 * ((f_s - (a_u - (a_u - f_s))) + ((f_tl + f_e) - (a_u - f_s))); end if;
      elsif -a_x = 0 or f_b = 0 then
        a_u := -a_x * f_b + a_x;
      else
        a_u := fdlibm_fma_wide(a => -a_x, b => f_b, c => a_x);
      end if;
      z := a_u; exit;
    end if;
    f_b := a_s1 + a_s2;
    f_c := -case a_id when 0 then 2.26987774529616870924e-17 when 1 then 3.06161699786838301793e-17 when 2 then 1.39033110312309984516e-17 else 6.12323399573676603587e-17 end;
    if abs(a_x) >= 1e-144 and abs(a_x) <= 1e144 and abs(f_b) >= 1e-144 and abs(f_b) <= 1e144 and abs(f_c) <= 1e288 then
      f_p := a_x * f_b;
      f_ah := (a_x * 134217729 - (a_x * 134217729 - a_x));
      f_bh := (f_b * 134217729 - (f_b * 134217729 - f_b));
      f_e := (a_x - f_ah) * (f_b - f_bh) - (((f_p - f_ah * f_bh) - (a_x - f_ah) * f_bh) - f_ah * (f_b - f_bh));
      f_s := f_c + f_p;
      f_tl := (f_c - (f_s - (f_s - f_c))) + (f_p - (f_s - f_c));
      f_w := (f_tl - ((f_tl + f_e) - ((f_tl + f_e) - f_tl))) + (f_e - ((f_tl + f_e) - f_tl));
      a_u := f_s + (f_tl + f_e);
      if f_w <> 0 and ((f_s - (a_u - (a_u - f_s))) + ((f_tl + f_e) - (a_u - f_s))) <> 0 and (a_u + 2 * ((f_s - (a_u - (a_u - f_s))) + ((f_tl + f_e) - (a_u - f_s)))) - a_u = 2 * ((f_s - (a_u - (a_u - f_s))) + ((f_tl + f_e) - (a_u - f_s))) and (f_w < 0) = (((f_s - (a_u - (a_u - f_s))) + ((f_tl + f_e) - (a_u - f_s))) < 0) then a_u := a_u + 2 * ((f_s - (a_u - (a_u - f_s))) + ((f_tl + f_e) - (a_u - f_s))); end if;
    elsif a_x = 0 or f_b = 0 then
      a_u := a_x * f_b + f_c;
    else
      a_u := fdlibm_fma_wide(a => a_x, b => f_b, c => f_c);
    end if;
    a_z := case a_id when 0 then 4.63647609000806093515e-01 when 1 then 7.85398163397448278999e-01
      when 2 then 9.82793723247329054082e-01 else 1.57079632679489655800e+00 end - (a_u - a_x);
    z := case when a_hx < 0 then -a_z else a_z end; exit;
  end loop;

  end if;
  return case m when 0 then z when 1 then -z when 2 then 3.1415926535897931160E+00 - (z - 1.2246467991473531772E-16)
    else (z - 1.2246467991473531772E-16) - 3.1415926535897931160E+00 end;
end $$;

-- V8's exp (ieee754.cc; Math.exp). t × ln2HI is exact (11 by 32 bits), so its fused and unfused forms agree.
create function p3.fdlibm_exp(x float8) returns float8 language plpgsql immutable as $$
declare f_a float8; f_b float8; f_c float8; f_p float8; f_ah float8; f_bh float8; f_e float8; f_s float8; f_tl float8; f_w float8; e_x float8; e_hx int; e_xsb int; e_hi float8; e_lo float8; e_k int; e_t float8; e_c float8; e_y float8; e_u float8;
 res float8;
begin
  loop
    e_x := x;
    e_hx := (int8(float8send(e_x)) >> 32)::int;
    e_xsb := (e_hx >> 31) & 1;
    e_hi := 0;
    e_lo := 0;
    e_k := 0;
    e_hx := e_hx & 2147483647;
    if e_hx >= 0x40862E42 then
      if e_hx >= 0x7FF00000 then
        if (e_hx & 0xFFFFF) <> 0 or (int8(float8send(e_x)) & 4294967295) <> 0 then res := e_x; exit; end if;
        res := case when e_xsb = 0 then e_x else 0 end; exit;
      end if;
      if e_x > 7.09782712893383973096e+02 then res := 'Infinity'; exit; end if;
      if e_x < -7.45133219101941108420e+02 then res := 0; exit; end if;
    end if;
    if e_hx > 0x3FD62E42 then
      if e_hx < 0x3FF0A2B2 then
        if e_x = 1 then res := 2.718281828459045; exit; end if;
        e_hi := e_x - case when e_xsb = 0 then 6.93147180369123816490e-01 else -6.93147180369123816490e-01 end;
        e_lo := case when e_xsb = 0 then 1.90821492927058770002e-10 else -1.90821492927058770002e-10 end;
        e_k := 1 - e_xsb - e_xsb;
      else
        f_c := case when e_xsb = 0 then 0.5 else -0.5 end;
        if abs((1.44269504088896338700e+00)::float8) >= 1e-144 and abs((1.44269504088896338700e+00)::float8) <= 1e144 and abs(e_x) >= 1e-144 and abs(e_x) <= 1e144 and abs(f_c) <= 1e288 then
          f_p := (1.44269504088896338700e+00)::float8 * e_x;
          f_bh := (e_x * 134217729 - (e_x * 134217729 - e_x));
          f_e := ((1.44269504088896338700e+00)::float8 - ((1.44269504088896338700e+00)::float8 * 134217729 - ((1.44269504088896338700e+00)::float8 * 134217729 - (1.44269504088896338700e+00)::float8))) * (e_x - f_bh) - (((f_p - ((1.44269504088896338700e+00)::float8 * 134217729 - ((1.44269504088896338700e+00)::float8 * 134217729 - (1.44269504088896338700e+00)::float8)) * f_bh) - ((1.44269504088896338700e+00)::float8 - ((1.44269504088896338700e+00)::float8 * 134217729 - ((1.44269504088896338700e+00)::float8 * 134217729 - (1.44269504088896338700e+00)::float8))) * f_bh) - ((1.44269504088896338700e+00)::float8 * 134217729 - ((1.44269504088896338700e+00)::float8 * 134217729 - (1.44269504088896338700e+00)::float8)) * (e_x - f_bh));
          f_s := f_c + f_p;
          f_tl := (f_c - (f_s - (f_s - f_c))) + (f_p - (f_s - f_c));
          f_w := (f_tl - ((f_tl + f_e) - ((f_tl + f_e) - f_tl))) + (f_e - ((f_tl + f_e) - f_tl));
          e_u := f_s + (f_tl + f_e);
          if f_w <> 0 and ((f_s - (e_u - (e_u - f_s))) + ((f_tl + f_e) - (e_u - f_s))) <> 0 and (e_u + 2 * ((f_s - (e_u - (e_u - f_s))) + ((f_tl + f_e) - (e_u - f_s)))) - e_u = 2 * ((f_s - (e_u - (e_u - f_s))) + ((f_tl + f_e) - (e_u - f_s))) and (f_w < 0) = (((f_s - (e_u - (e_u - f_s))) + ((f_tl + f_e) - (e_u - f_s))) < 0) then e_u := e_u + 2 * ((f_s - (e_u - (e_u - f_s))) + ((f_tl + f_e) - (e_u - f_s))); end if;
        elsif (1.44269504088896338700e+00)::float8 = 0 or e_x = 0 then
          e_u := (1.44269504088896338700e+00)::float8 * e_x + f_c;
        else
          e_u := fdlibm_fma_wide(a => (1.44269504088896338700e+00)::float8, b => e_x, c => f_c);
        end if;
        e_k := trunc(e_u)::int;
        e_t := e_k;
        e_hi := e_x - e_t * 6.93147180369123816490e-01;
        e_lo := e_t * 1.90821492927058770002e-10;
      end if;
      e_x := e_hi - e_lo;
    elsif e_hx < 0x3E300000 then
      res := 1 + e_x; exit;
    end if;
    e_t := e_x * e_x;
    if abs(e_t) >= 1e-144 and abs(e_t) <= 1e144 and abs((4.13813679705723846039e-08)::float8) >= 1e-144 and abs((4.13813679705723846039e-08)::float8) <= 1e144 and abs((-1.65339022054652515390e-06)::float8) <= 1e288 then
      f_p := e_t * (4.13813679705723846039e-08)::float8;
      f_ah := (e_t * 134217729 - (e_t * 134217729 - e_t));
      f_e := (e_t - f_ah) * ((4.13813679705723846039e-08)::float8 - ((4.13813679705723846039e-08)::float8 * 134217729 - ((4.13813679705723846039e-08)::float8 * 134217729 - (4.13813679705723846039e-08)::float8))) - (((f_p - f_ah * ((4.13813679705723846039e-08)::float8 * 134217729 - ((4.13813679705723846039e-08)::float8 * 134217729 - (4.13813679705723846039e-08)::float8))) - (e_t - f_ah) * ((4.13813679705723846039e-08)::float8 * 134217729 - ((4.13813679705723846039e-08)::float8 * 134217729 - (4.13813679705723846039e-08)::float8))) - f_ah * ((4.13813679705723846039e-08)::float8 - ((4.13813679705723846039e-08)::float8 * 134217729 - ((4.13813679705723846039e-08)::float8 * 134217729 - (4.13813679705723846039e-08)::float8))));
      f_s := (-1.65339022054652515390e-06)::float8 + f_p;
      f_tl := ((-1.65339022054652515390e-06)::float8 - (f_s - (f_s - (-1.65339022054652515390e-06)::float8))) + (f_p - (f_s - (-1.65339022054652515390e-06)::float8));
      f_w := (f_tl - ((f_tl + f_e) - ((f_tl + f_e) - f_tl))) + (f_e - ((f_tl + f_e) - f_tl));
      e_c := f_s + (f_tl + f_e);
      if f_w <> 0 and ((f_s - (e_c - (e_c - f_s))) + ((f_tl + f_e) - (e_c - f_s))) <> 0 and (e_c + 2 * ((f_s - (e_c - (e_c - f_s))) + ((f_tl + f_e) - (e_c - f_s)))) - e_c = 2 * ((f_s - (e_c - (e_c - f_s))) + ((f_tl + f_e) - (e_c - f_s))) and (f_w < 0) = (((f_s - (e_c - (e_c - f_s))) + ((f_tl + f_e) - (e_c - f_s))) < 0) then e_c := e_c + 2 * ((f_s - (e_c - (e_c - f_s))) + ((f_tl + f_e) - (e_c - f_s))); end if;
    elsif e_t = 0 or (4.13813679705723846039e-08)::float8 = 0 then
      e_c := e_t * (4.13813679705723846039e-08)::float8 + (-1.65339022054652515390e-06)::float8;
    else
      e_c := fdlibm_fma_wide(a => e_t, b => (4.13813679705723846039e-08)::float8, c => (-1.65339022054652515390e-06)::float8);
    end if;
    if abs(e_t) >= 1e-144 and abs(e_t) <= 1e144 and abs(e_c) >= 1e-144 and abs(e_c) <= 1e144 and abs((6.61375632143793436117e-05)::float8) <= 1e288 then
      f_p := e_t * e_c;
      f_ah := (e_t * 134217729 - (e_t * 134217729 - e_t));
      f_bh := (e_c * 134217729 - (e_c * 134217729 - e_c));
      f_e := (e_t - f_ah) * (e_c - f_bh) - (((f_p - f_ah * f_bh) - (e_t - f_ah) * f_bh) - f_ah * (e_c - f_bh));
      f_s := (6.61375632143793436117e-05)::float8 + f_p;
      f_tl := ((6.61375632143793436117e-05)::float8 - (f_s - (f_s - (6.61375632143793436117e-05)::float8))) + (f_p - (f_s - (6.61375632143793436117e-05)::float8));
      f_w := (f_tl - ((f_tl + f_e) - ((f_tl + f_e) - f_tl))) + (f_e - ((f_tl + f_e) - f_tl));
      e_c := f_s + (f_tl + f_e);
      if f_w <> 0 and ((f_s - (e_c - (e_c - f_s))) + ((f_tl + f_e) - (e_c - f_s))) <> 0 and (e_c + 2 * ((f_s - (e_c - (e_c - f_s))) + ((f_tl + f_e) - (e_c - f_s)))) - e_c = 2 * ((f_s - (e_c - (e_c - f_s))) + ((f_tl + f_e) - (e_c - f_s))) and (f_w < 0) = (((f_s - (e_c - (e_c - f_s))) + ((f_tl + f_e) - (e_c - f_s))) < 0) then e_c := e_c + 2 * ((f_s - (e_c - (e_c - f_s))) + ((f_tl + f_e) - (e_c - f_s))); end if;
    elsif e_t = 0 or e_c = 0 then
      e_c := e_t * e_c + (6.61375632143793436117e-05)::float8;
    else
      e_c := fdlibm_fma_wide(a => e_t, b => e_c, c => (6.61375632143793436117e-05)::float8);
    end if;
    if abs(e_t) >= 1e-144 and abs(e_t) <= 1e144 and abs(e_c) >= 1e-144 and abs(e_c) <= 1e144 and abs((-2.77777777770155933842e-03)::float8) <= 1e288 then
      f_p := e_t * e_c;
      f_ah := (e_t * 134217729 - (e_t * 134217729 - e_t));
      f_bh := (e_c * 134217729 - (e_c * 134217729 - e_c));
      f_e := (e_t - f_ah) * (e_c - f_bh) - (((f_p - f_ah * f_bh) - (e_t - f_ah) * f_bh) - f_ah * (e_c - f_bh));
      f_s := (-2.77777777770155933842e-03)::float8 + f_p;
      f_tl := ((-2.77777777770155933842e-03)::float8 - (f_s - (f_s - (-2.77777777770155933842e-03)::float8))) + (f_p - (f_s - (-2.77777777770155933842e-03)::float8));
      f_w := (f_tl - ((f_tl + f_e) - ((f_tl + f_e) - f_tl))) + (f_e - ((f_tl + f_e) - f_tl));
      e_c := f_s + (f_tl + f_e);
      if f_w <> 0 and ((f_s - (e_c - (e_c - f_s))) + ((f_tl + f_e) - (e_c - f_s))) <> 0 and (e_c + 2 * ((f_s - (e_c - (e_c - f_s))) + ((f_tl + f_e) - (e_c - f_s)))) - e_c = 2 * ((f_s - (e_c - (e_c - f_s))) + ((f_tl + f_e) - (e_c - f_s))) and (f_w < 0) = (((f_s - (e_c - (e_c - f_s))) + ((f_tl + f_e) - (e_c - f_s))) < 0) then e_c := e_c + 2 * ((f_s - (e_c - (e_c - f_s))) + ((f_tl + f_e) - (e_c - f_s))); end if;
    elsif e_t = 0 or e_c = 0 then
      e_c := e_t * e_c + (-2.77777777770155933842e-03)::float8;
    else
      e_c := fdlibm_fma_wide(a => e_t, b => e_c, c => (-2.77777777770155933842e-03)::float8);
    end if;
    if abs(e_t) >= 1e-144 and abs(e_t) <= 1e144 and abs(e_c) >= 1e-144 and abs(e_c) <= 1e144 and abs((1.66666666666666019037e-01)::float8) <= 1e288 then
      f_p := e_t * e_c;
      f_ah := (e_t * 134217729 - (e_t * 134217729 - e_t));
      f_bh := (e_c * 134217729 - (e_c * 134217729 - e_c));
      f_e := (e_t - f_ah) * (e_c - f_bh) - (((f_p - f_ah * f_bh) - (e_t - f_ah) * f_bh) - f_ah * (e_c - f_bh));
      f_s := (1.66666666666666019037e-01)::float8 + f_p;
      f_tl := ((1.66666666666666019037e-01)::float8 - (f_s - (f_s - (1.66666666666666019037e-01)::float8))) + (f_p - (f_s - (1.66666666666666019037e-01)::float8));
      f_w := (f_tl - ((f_tl + f_e) - ((f_tl + f_e) - f_tl))) + (f_e - ((f_tl + f_e) - f_tl));
      e_c := f_s + (f_tl + f_e);
      if f_w <> 0 and ((f_s - (e_c - (e_c - f_s))) + ((f_tl + f_e) - (e_c - f_s))) <> 0 and (e_c + 2 * ((f_s - (e_c - (e_c - f_s))) + ((f_tl + f_e) - (e_c - f_s)))) - e_c = 2 * ((f_s - (e_c - (e_c - f_s))) + ((f_tl + f_e) - (e_c - f_s))) and (f_w < 0) = (((f_s - (e_c - (e_c - f_s))) + ((f_tl + f_e) - (e_c - f_s))) < 0) then e_c := e_c + 2 * ((f_s - (e_c - (e_c - f_s))) + ((f_tl + f_e) - (e_c - f_s))); end if;
    elsif e_t = 0 or e_c = 0 then
      e_c := e_t * e_c + (1.66666666666666019037e-01)::float8;
    else
      e_c := fdlibm_fma_wide(a => e_t, b => e_c, c => (1.66666666666666019037e-01)::float8);
    end if;
    if abs(-e_t) >= 1e-144 and abs(-e_t) <= 1e144 and abs(e_c) >= 1e-144 and abs(e_c) <= 1e144 and abs(e_x) <= 1e288 then
      f_p := -e_t * e_c;
      f_ah := (-e_t * 134217729 - (-e_t * 134217729 - -e_t));
      f_bh := (e_c * 134217729 - (e_c * 134217729 - e_c));
      f_e := (-e_t - f_ah) * (e_c - f_bh) - (((f_p - f_ah * f_bh) - (-e_t - f_ah) * f_bh) - f_ah * (e_c - f_bh));
      f_s := e_x + f_p;
      f_tl := (e_x - (f_s - (f_s - e_x))) + (f_p - (f_s - e_x));
      f_w := (f_tl - ((f_tl + f_e) - ((f_tl + f_e) - f_tl))) + (f_e - ((f_tl + f_e) - f_tl));
      e_c := f_s + (f_tl + f_e);
      if f_w <> 0 and ((f_s - (e_c - (e_c - f_s))) + ((f_tl + f_e) - (e_c - f_s))) <> 0 and (e_c + 2 * ((f_s - (e_c - (e_c - f_s))) + ((f_tl + f_e) - (e_c - f_s)))) - e_c = 2 * ((f_s - (e_c - (e_c - f_s))) + ((f_tl + f_e) - (e_c - f_s))) and (f_w < 0) = (((f_s - (e_c - (e_c - f_s))) + ((f_tl + f_e) - (e_c - f_s))) < 0) then e_c := e_c + 2 * ((f_s - (e_c - (e_c - f_s))) + ((f_tl + f_e) - (e_c - f_s))); end if;
    elsif -e_t = 0 or e_c = 0 then
      e_c := -e_t * e_c + e_x;
    else
      e_c := fdlibm_fma_wide(a => -e_t, b => e_c, c => e_x);
    end if;
    if e_k = 0 then res := 1 - ((e_x * e_c) / (e_c - 2) - e_x); exit; end if;
    e_y := 1 - ((e_lo - (e_x * e_c) / (2 - e_c)) - e_hi);
    if e_k >= -1021 then
      if e_k = 1024 then res := case when e_y >= 1 then 'Infinity'::float8 else e_y * 2 * 8.988465674311579539e307 end; exit; end if;
      res := e_y * (('{2.2250738585072014e-308,4.1045368012983762e-289,7.571533991467358e-270,1.3967014978599092e-250,2.5764595078388533e-231,4.7527289157379e-212,8.767237396033612e-193,1.617269844780878e-173,2.983336292480083e-154,5.503284107318959e-135,1.0151767349262597e-115,1.8726705418768793e-96,3.454467422037778e-77,6.372367644529809e-58,1.1754943508222875e-38,2.168404344971009e-19,4,73786976294838210000,1.361129467683754e+39,2.5108406941546723e+58,4.631683569492648e+77,8.54394814368364e+96,1.5760802478557792e+116,2.9073548971824276e+135,5.363123171977039e+154,9.893216058924181e+173,1.824976247048878e+193,3.366486976990959e+212,6.210072369202836e+231,1.1455561567389984e+251,2.113178124542661e+270,3.89812560456e+289}'::float8[])[(((e_k) + 1022) >> 6) + 1] * ('{1,2,4,8,16,32,64,128,256,512,1024,2048,4096,8192,16384,32768,65536,131072,262144,524288,1048576,2097152,4194304,8388608,16777216,33554432,67108864,134217728,268435456,536870912,1073741824,2147483648,4294967296,8589934592,17179869184,34359738368,68719476736,137438953472,274877906944,549755813888,1099511627776,2199023255552,4398046511104,8796093022208,17592186044416,35184372088832,70368744177664,140737488355328,281474976710656,562949953421312,1125899906842624,2251799813685248,4503599627370496,9007199254740992,18014398509481984,36028797018963970,72057594037927940,144115188075855870,288230376151711740,576460752303423500,1152921504606847000,2305843009213694000,4611686018427388000,9223372036854776000}'::float8[])[(((e_k) + 1022) & 63) + 1]); exit;
    end if;
    e_y := e_y * (('{2.2250738585072014e-308,4.1045368012983762e-289,7.571533991467358e-270,1.3967014978599092e-250,2.5764595078388533e-231,4.7527289157379e-212,8.767237396033612e-193,1.617269844780878e-173,2.983336292480083e-154,5.503284107318959e-135,1.0151767349262597e-115,1.8726705418768793e-96,3.454467422037778e-77,6.372367644529809e-58,1.1754943508222875e-38,2.168404344971009e-19,4,73786976294838210000,1.361129467683754e+39,2.5108406941546723e+58,4.631683569492648e+77,8.54394814368364e+96,1.5760802478557792e+116,2.9073548971824276e+135,5.363123171977039e+154,9.893216058924181e+173,1.824976247048878e+193,3.366486976990959e+212,6.210072369202836e+231,1.1455561567389984e+251,2.113178124542661e+270,3.89812560456e+289}'::float8[])[(((e_k + 1000) + 1022) >> 6) + 1] * ('{1,2,4,8,16,32,64,128,256,512,1024,2048,4096,8192,16384,32768,65536,131072,262144,524288,1048576,2097152,4194304,8388608,16777216,33554432,67108864,134217728,268435456,536870912,1073741824,2147483648,4294967296,8589934592,17179869184,34359738368,68719476736,137438953472,274877906944,549755813888,1099511627776,2199023255552,4398046511104,8796093022208,17592186044416,35184372088832,70368744177664,140737488355328,281474976710656,562949953421312,1125899906842624,2251799813685248,4503599627370496,9007199254740992,18014398509481984,36028797018963970,72057594037927940,144115188075855870,288230376151711740,576460752303423500,1152921504606847000,2305843009213694000,4611686018427388000,9223372036854776000}'::float8[])[(((e_k + 1000) + 1022) & 63) + 1]);
    res := case when e_y <= 2.6469779601696886e-23 then 0 else e_y * 9.33263618503218878990e-302 end; exit;
  end loop;

  return res;
end $$;
-- V8's expm1 (ieee754.cc), which sinh, cosh and tanh call. 0.5 × and 2 × a value and t × ln2_hi (11 by 32 bits) are
-- exact here, so their fused and unfused forms agree.
create function p3.fdlibm_expm1(x float8) returns float8 language plpgsql immutable as $$
declare f_a float8; f_b float8; f_c float8; f_p float8; f_ah float8; f_bh float8; f_e float8; f_s float8; f_tl float8; f_w float8; m_x float8; m_hx int; m_xsb boolean; m_k int; m_hi float8; m_lo float8; m_c float8; m_t float8; m_e float8; m_hxs float8; m_hfx float8; m_r1 float8; m_y float8; m_u float8;
 res float8;
begin
  loop
    m_x := x;
    m_hx := (int8(float8send(m_x)) >> 32)::int;
    m_xsb := m_hx < 0;
    m_hx := m_hx & 2147483647;
    if m_hx >= 0x4043687A then
      if m_hx >= 0x40862E42 then
        if m_hx >= 0x7FF00000 then
          if (m_hx & 0xFFFFF) <> 0 or (int8(float8send(m_x)) & 4294967295) <> 0 then res := m_x; exit; end if;
          res := case when m_xsb then -1 else m_x end; exit;
        end if;
        if m_x > 7.09782712893383973096e+02 then res := 'Infinity'; exit; end if;
      end if;
      if m_xsb then res := -1; exit; end if;
    end if;
    if m_hx > 0x3FD62E42 then
      if m_hx < 0x3FF0A2B2 then
        if not m_xsb then
          m_hi := m_x - 6.93147180369123816490e-01; m_lo := 1.90821492927058770002e-10; m_k := 1;
        else
          m_hi := m_x + 6.93147180369123816490e-01; m_lo := -1.90821492927058770002e-10; m_k := -1;
        end if;
      else
        f_c := case when m_xsb then -0.5 else 0.5 end;
        if abs((1.44269504088896338700e+00)::float8) >= 1e-144 and abs((1.44269504088896338700e+00)::float8) <= 1e144 and abs(m_x) >= 1e-144 and abs(m_x) <= 1e144 and abs(f_c) <= 1e288 then
          f_p := (1.44269504088896338700e+00)::float8 * m_x;
          f_bh := (m_x * 134217729 - (m_x * 134217729 - m_x));
          f_e := ((1.44269504088896338700e+00)::float8 - ((1.44269504088896338700e+00)::float8 * 134217729 - ((1.44269504088896338700e+00)::float8 * 134217729 - (1.44269504088896338700e+00)::float8))) * (m_x - f_bh) - (((f_p - ((1.44269504088896338700e+00)::float8 * 134217729 - ((1.44269504088896338700e+00)::float8 * 134217729 - (1.44269504088896338700e+00)::float8)) * f_bh) - ((1.44269504088896338700e+00)::float8 - ((1.44269504088896338700e+00)::float8 * 134217729 - ((1.44269504088896338700e+00)::float8 * 134217729 - (1.44269504088896338700e+00)::float8))) * f_bh) - ((1.44269504088896338700e+00)::float8 * 134217729 - ((1.44269504088896338700e+00)::float8 * 134217729 - (1.44269504088896338700e+00)::float8)) * (m_x - f_bh));
          f_s := f_c + f_p;
          f_tl := (f_c - (f_s - (f_s - f_c))) + (f_p - (f_s - f_c));
          f_w := (f_tl - ((f_tl + f_e) - ((f_tl + f_e) - f_tl))) + (f_e - ((f_tl + f_e) - f_tl));
          m_u := f_s + (f_tl + f_e);
          if f_w <> 0 and ((f_s - (m_u - (m_u - f_s))) + ((f_tl + f_e) - (m_u - f_s))) <> 0 and (m_u + 2 * ((f_s - (m_u - (m_u - f_s))) + ((f_tl + f_e) - (m_u - f_s)))) - m_u = 2 * ((f_s - (m_u - (m_u - f_s))) + ((f_tl + f_e) - (m_u - f_s))) and (f_w < 0) = (((f_s - (m_u - (m_u - f_s))) + ((f_tl + f_e) - (m_u - f_s))) < 0) then m_u := m_u + 2 * ((f_s - (m_u - (m_u - f_s))) + ((f_tl + f_e) - (m_u - f_s))); end if;
        elsif (1.44269504088896338700e+00)::float8 = 0 or m_x = 0 then
          m_u := (1.44269504088896338700e+00)::float8 * m_x + f_c;
        else
          m_u := fdlibm_fma_wide(a => (1.44269504088896338700e+00)::float8, b => m_x, c => f_c);
        end if;
        m_k := trunc(m_u)::int;
        m_t := m_k;
        m_hi := m_x - m_t * 6.93147180369123816490e-01;
        m_lo := m_t * 1.90821492927058770002e-10;
      end if;
      m_x := m_hi - m_lo;
      m_c := (m_hi - m_x) - m_lo;
    elsif m_hx < 0x3C900000 then
      res := m_x; exit;
    else
      m_k := 0;
    end if;
    m_hfx := 0.5 * m_x;
    m_hxs := m_x * m_hfx;
    if abs(m_hxs) >= 1e-144 and abs(m_hxs) <= 1e144 and abs((-2.01099218183624371326e-07)::float8) >= 1e-144 and abs((-2.01099218183624371326e-07)::float8) <= 1e144 and abs((4.00821782732936239552e-06)::float8) <= 1e288 then
      f_p := m_hxs * (-2.01099218183624371326e-07)::float8;
      f_ah := (m_hxs * 134217729 - (m_hxs * 134217729 - m_hxs));
      f_e := (m_hxs - f_ah) * ((-2.01099218183624371326e-07)::float8 - ((-2.01099218183624371326e-07)::float8 * 134217729 - ((-2.01099218183624371326e-07)::float8 * 134217729 - (-2.01099218183624371326e-07)::float8))) - (((f_p - f_ah * ((-2.01099218183624371326e-07)::float8 * 134217729 - ((-2.01099218183624371326e-07)::float8 * 134217729 - (-2.01099218183624371326e-07)::float8))) - (m_hxs - f_ah) * ((-2.01099218183624371326e-07)::float8 * 134217729 - ((-2.01099218183624371326e-07)::float8 * 134217729 - (-2.01099218183624371326e-07)::float8))) - f_ah * ((-2.01099218183624371326e-07)::float8 - ((-2.01099218183624371326e-07)::float8 * 134217729 - ((-2.01099218183624371326e-07)::float8 * 134217729 - (-2.01099218183624371326e-07)::float8))));
      f_s := (4.00821782732936239552e-06)::float8 + f_p;
      f_tl := ((4.00821782732936239552e-06)::float8 - (f_s - (f_s - (4.00821782732936239552e-06)::float8))) + (f_p - (f_s - (4.00821782732936239552e-06)::float8));
      f_w := (f_tl - ((f_tl + f_e) - ((f_tl + f_e) - f_tl))) + (f_e - ((f_tl + f_e) - f_tl));
      m_r1 := f_s + (f_tl + f_e);
      if f_w <> 0 and ((f_s - (m_r1 - (m_r1 - f_s))) + ((f_tl + f_e) - (m_r1 - f_s))) <> 0 and (m_r1 + 2 * ((f_s - (m_r1 - (m_r1 - f_s))) + ((f_tl + f_e) - (m_r1 - f_s)))) - m_r1 = 2 * ((f_s - (m_r1 - (m_r1 - f_s))) + ((f_tl + f_e) - (m_r1 - f_s))) and (f_w < 0) = (((f_s - (m_r1 - (m_r1 - f_s))) + ((f_tl + f_e) - (m_r1 - f_s))) < 0) then m_r1 := m_r1 + 2 * ((f_s - (m_r1 - (m_r1 - f_s))) + ((f_tl + f_e) - (m_r1 - f_s))); end if;
    elsif m_hxs = 0 or (-2.01099218183624371326e-07)::float8 = 0 then
      m_r1 := m_hxs * (-2.01099218183624371326e-07)::float8 + (4.00821782732936239552e-06)::float8;
    else
      m_r1 := fdlibm_fma_wide(a => m_hxs, b => (-2.01099218183624371326e-07)::float8, c => (4.00821782732936239552e-06)::float8);
    end if;
    if abs(m_hxs) >= 1e-144 and abs(m_hxs) <= 1e144 and abs(m_r1) >= 1e-144 and abs(m_r1) <= 1e144 and abs((-7.93650757867487942473e-05)::float8) <= 1e288 then
      f_p := m_hxs * m_r1;
      f_ah := (m_hxs * 134217729 - (m_hxs * 134217729 - m_hxs));
      f_bh := (m_r1 * 134217729 - (m_r1 * 134217729 - m_r1));
      f_e := (m_hxs - f_ah) * (m_r1 - f_bh) - (((f_p - f_ah * f_bh) - (m_hxs - f_ah) * f_bh) - f_ah * (m_r1 - f_bh));
      f_s := (-7.93650757867487942473e-05)::float8 + f_p;
      f_tl := ((-7.93650757867487942473e-05)::float8 - (f_s - (f_s - (-7.93650757867487942473e-05)::float8))) + (f_p - (f_s - (-7.93650757867487942473e-05)::float8));
      f_w := (f_tl - ((f_tl + f_e) - ((f_tl + f_e) - f_tl))) + (f_e - ((f_tl + f_e) - f_tl));
      m_r1 := f_s + (f_tl + f_e);
      if f_w <> 0 and ((f_s - (m_r1 - (m_r1 - f_s))) + ((f_tl + f_e) - (m_r1 - f_s))) <> 0 and (m_r1 + 2 * ((f_s - (m_r1 - (m_r1 - f_s))) + ((f_tl + f_e) - (m_r1 - f_s)))) - m_r1 = 2 * ((f_s - (m_r1 - (m_r1 - f_s))) + ((f_tl + f_e) - (m_r1 - f_s))) and (f_w < 0) = (((f_s - (m_r1 - (m_r1 - f_s))) + ((f_tl + f_e) - (m_r1 - f_s))) < 0) then m_r1 := m_r1 + 2 * ((f_s - (m_r1 - (m_r1 - f_s))) + ((f_tl + f_e) - (m_r1 - f_s))); end if;
    elsif m_hxs = 0 or m_r1 = 0 then
      m_r1 := m_hxs * m_r1 + (-7.93650757867487942473e-05)::float8;
    else
      m_r1 := fdlibm_fma_wide(a => m_hxs, b => m_r1, c => (-7.93650757867487942473e-05)::float8);
    end if;
    if abs(m_hxs) >= 1e-144 and abs(m_hxs) <= 1e144 and abs(m_r1) >= 1e-144 and abs(m_r1) <= 1e144 and abs((1.58730158725481460165e-03)::float8) <= 1e288 then
      f_p := m_hxs * m_r1;
      f_ah := (m_hxs * 134217729 - (m_hxs * 134217729 - m_hxs));
      f_bh := (m_r1 * 134217729 - (m_r1 * 134217729 - m_r1));
      f_e := (m_hxs - f_ah) * (m_r1 - f_bh) - (((f_p - f_ah * f_bh) - (m_hxs - f_ah) * f_bh) - f_ah * (m_r1 - f_bh));
      f_s := (1.58730158725481460165e-03)::float8 + f_p;
      f_tl := ((1.58730158725481460165e-03)::float8 - (f_s - (f_s - (1.58730158725481460165e-03)::float8))) + (f_p - (f_s - (1.58730158725481460165e-03)::float8));
      f_w := (f_tl - ((f_tl + f_e) - ((f_tl + f_e) - f_tl))) + (f_e - ((f_tl + f_e) - f_tl));
      m_r1 := f_s + (f_tl + f_e);
      if f_w <> 0 and ((f_s - (m_r1 - (m_r1 - f_s))) + ((f_tl + f_e) - (m_r1 - f_s))) <> 0 and (m_r1 + 2 * ((f_s - (m_r1 - (m_r1 - f_s))) + ((f_tl + f_e) - (m_r1 - f_s)))) - m_r1 = 2 * ((f_s - (m_r1 - (m_r1 - f_s))) + ((f_tl + f_e) - (m_r1 - f_s))) and (f_w < 0) = (((f_s - (m_r1 - (m_r1 - f_s))) + ((f_tl + f_e) - (m_r1 - f_s))) < 0) then m_r1 := m_r1 + 2 * ((f_s - (m_r1 - (m_r1 - f_s))) + ((f_tl + f_e) - (m_r1 - f_s))); end if;
    elsif m_hxs = 0 or m_r1 = 0 then
      m_r1 := m_hxs * m_r1 + (1.58730158725481460165e-03)::float8;
    else
      m_r1 := fdlibm_fma_wide(a => m_hxs, b => m_r1, c => (1.58730158725481460165e-03)::float8);
    end if;
    if abs(m_hxs) >= 1e-144 and abs(m_hxs) <= 1e144 and abs(m_r1) >= 1e-144 and abs(m_r1) <= 1e144 and abs((-3.33333333333331316428e-02)::float8) <= 1e288 then
      f_p := m_hxs * m_r1;
      f_ah := (m_hxs * 134217729 - (m_hxs * 134217729 - m_hxs));
      f_bh := (m_r1 * 134217729 - (m_r1 * 134217729 - m_r1));
      f_e := (m_hxs - f_ah) * (m_r1 - f_bh) - (((f_p - f_ah * f_bh) - (m_hxs - f_ah) * f_bh) - f_ah * (m_r1 - f_bh));
      f_s := (-3.33333333333331316428e-02)::float8 + f_p;
      f_tl := ((-3.33333333333331316428e-02)::float8 - (f_s - (f_s - (-3.33333333333331316428e-02)::float8))) + (f_p - (f_s - (-3.33333333333331316428e-02)::float8));
      f_w := (f_tl - ((f_tl + f_e) - ((f_tl + f_e) - f_tl))) + (f_e - ((f_tl + f_e) - f_tl));
      m_r1 := f_s + (f_tl + f_e);
      if f_w <> 0 and ((f_s - (m_r1 - (m_r1 - f_s))) + ((f_tl + f_e) - (m_r1 - f_s))) <> 0 and (m_r1 + 2 * ((f_s - (m_r1 - (m_r1 - f_s))) + ((f_tl + f_e) - (m_r1 - f_s)))) - m_r1 = 2 * ((f_s - (m_r1 - (m_r1 - f_s))) + ((f_tl + f_e) - (m_r1 - f_s))) and (f_w < 0) = (((f_s - (m_r1 - (m_r1 - f_s))) + ((f_tl + f_e) - (m_r1 - f_s))) < 0) then m_r1 := m_r1 + 2 * ((f_s - (m_r1 - (m_r1 - f_s))) + ((f_tl + f_e) - (m_r1 - f_s))); end if;
    elsif m_hxs = 0 or m_r1 = 0 then
      m_r1 := m_hxs * m_r1 + (-3.33333333333331316428e-02)::float8;
    else
      m_r1 := fdlibm_fma_wide(a => m_hxs, b => m_r1, c => (-3.33333333333331316428e-02)::float8);
    end if;
    if abs(m_hxs) >= 1e-144 and abs(m_hxs) <= 1e144 and abs(m_r1) >= 1e-144 and abs(m_r1) <= 1e144 and abs((1)::float8) <= 1e288 then
      f_p := m_hxs * m_r1;
      f_ah := (m_hxs * 134217729 - (m_hxs * 134217729 - m_hxs));
      f_bh := (m_r1 * 134217729 - (m_r1 * 134217729 - m_r1));
      f_e := (m_hxs - f_ah) * (m_r1 - f_bh) - (((f_p - f_ah * f_bh) - (m_hxs - f_ah) * f_bh) - f_ah * (m_r1 - f_bh));
      f_s := (1)::float8 + f_p;
      f_tl := ((1)::float8 - (f_s - (f_s - (1)::float8))) + (f_p - (f_s - (1)::float8));
      f_w := (f_tl - ((f_tl + f_e) - ((f_tl + f_e) - f_tl))) + (f_e - ((f_tl + f_e) - f_tl));
      m_r1 := f_s + (f_tl + f_e);
      if f_w <> 0 and ((f_s - (m_r1 - (m_r1 - f_s))) + ((f_tl + f_e) - (m_r1 - f_s))) <> 0 and (m_r1 + 2 * ((f_s - (m_r1 - (m_r1 - f_s))) + ((f_tl + f_e) - (m_r1 - f_s)))) - m_r1 = 2 * ((f_s - (m_r1 - (m_r1 - f_s))) + ((f_tl + f_e) - (m_r1 - f_s))) and (f_w < 0) = (((f_s - (m_r1 - (m_r1 - f_s))) + ((f_tl + f_e) - (m_r1 - f_s))) < 0) then m_r1 := m_r1 + 2 * ((f_s - (m_r1 - (m_r1 - f_s))) + ((f_tl + f_e) - (m_r1 - f_s))); end if;
    elsif m_hxs = 0 or m_r1 = 0 then
      m_r1 := m_hxs * m_r1 + (1)::float8;
    else
      m_r1 := fdlibm_fma_wide(a => m_hxs, b => m_r1, c => (1)::float8);
    end if;
    if abs(-m_r1) >= 1e-144 and abs(-m_r1) <= 1e144 and abs(m_hfx) >= 1e-144 and abs(m_hfx) <= 1e144 and abs((3)::float8) <= 1e288 then
      f_p := -m_r1 * m_hfx;
      f_ah := (-m_r1 * 134217729 - (-m_r1 * 134217729 - -m_r1));
      f_bh := (m_hfx * 134217729 - (m_hfx * 134217729 - m_hfx));
      f_e := (-m_r1 - f_ah) * (m_hfx - f_bh) - (((f_p - f_ah * f_bh) - (-m_r1 - f_ah) * f_bh) - f_ah * (m_hfx - f_bh));
      f_s := (3)::float8 + f_p;
      f_tl := ((3)::float8 - (f_s - (f_s - (3)::float8))) + (f_p - (f_s - (3)::float8));
      f_w := (f_tl - ((f_tl + f_e) - ((f_tl + f_e) - f_tl))) + (f_e - ((f_tl + f_e) - f_tl));
      m_t := f_s + (f_tl + f_e);
      if f_w <> 0 and ((f_s - (m_t - (m_t - f_s))) + ((f_tl + f_e) - (m_t - f_s))) <> 0 and (m_t + 2 * ((f_s - (m_t - (m_t - f_s))) + ((f_tl + f_e) - (m_t - f_s)))) - m_t = 2 * ((f_s - (m_t - (m_t - f_s))) + ((f_tl + f_e) - (m_t - f_s))) and (f_w < 0) = (((f_s - (m_t - (m_t - f_s))) + ((f_tl + f_e) - (m_t - f_s))) < 0) then m_t := m_t + 2 * ((f_s - (m_t - (m_t - f_s))) + ((f_tl + f_e) - (m_t - f_s))); end if;
    elsif -m_r1 = 0 or m_hfx = 0 then
      m_t := -m_r1 * m_hfx + (3)::float8;
    else
      m_t := fdlibm_fma_wide(a => -m_r1, b => m_hfx, c => (3)::float8);
    end if;
    if abs(-m_x) >= 1e-144 and abs(-m_x) <= 1e144 and abs(m_t) >= 1e-144 and abs(m_t) <= 1e144 and abs((6)::float8) <= 1e288 then
      f_p := -m_x * m_t;
      f_ah := (-m_x * 134217729 - (-m_x * 134217729 - -m_x));
      f_bh := (m_t * 134217729 - (m_t * 134217729 - m_t));
      f_e := (-m_x - f_ah) * (m_t - f_bh) - (((f_p - f_ah * f_bh) - (-m_x - f_ah) * f_bh) - f_ah * (m_t - f_bh));
      f_s := (6)::float8 + f_p;
      f_tl := ((6)::float8 - (f_s - (f_s - (6)::float8))) + (f_p - (f_s - (6)::float8));
      f_w := (f_tl - ((f_tl + f_e) - ((f_tl + f_e) - f_tl))) + (f_e - ((f_tl + f_e) - f_tl));
      m_u := f_s + (f_tl + f_e);
      if f_w <> 0 and ((f_s - (m_u - (m_u - f_s))) + ((f_tl + f_e) - (m_u - f_s))) <> 0 and (m_u + 2 * ((f_s - (m_u - (m_u - f_s))) + ((f_tl + f_e) - (m_u - f_s)))) - m_u = 2 * ((f_s - (m_u - (m_u - f_s))) + ((f_tl + f_e) - (m_u - f_s))) and (f_w < 0) = (((f_s - (m_u - (m_u - f_s))) + ((f_tl + f_e) - (m_u - f_s))) < 0) then m_u := m_u + 2 * ((f_s - (m_u - (m_u - f_s))) + ((f_tl + f_e) - (m_u - f_s))); end if;
    elsif -m_x = 0 or m_t = 0 then
      m_u := -m_x * m_t + (6)::float8;
    else
      m_u := fdlibm_fma_wide(a => -m_x, b => m_t, c => (6)::float8);
    end if;
    m_e := m_hxs * ((m_r1 - m_t) / m_u);
    if m_k = 0 then
      if abs(m_x) >= 1e-144 and abs(m_x) <= 1e144 and abs(m_e) >= 1e-144 and abs(m_e) <= 1e144 and abs(-m_hxs) <= 1e288 then
        f_p := m_x * m_e;
        f_ah := (m_x * 134217729 - (m_x * 134217729 - m_x));
        f_bh := (m_e * 134217729 - (m_e * 134217729 - m_e));
        f_e := (m_x - f_ah) * (m_e - f_bh) - (((f_p - f_ah * f_bh) - (m_x - f_ah) * f_bh) - f_ah * (m_e - f_bh));
        f_s := -m_hxs + f_p;
        f_tl := (-m_hxs - (f_s - (f_s - -m_hxs))) + (f_p - (f_s - -m_hxs));
        f_w := (f_tl - ((f_tl + f_e) - ((f_tl + f_e) - f_tl))) + (f_e - ((f_tl + f_e) - f_tl));
        m_u := f_s + (f_tl + f_e);
        if f_w <> 0 and ((f_s - (m_u - (m_u - f_s))) + ((f_tl + f_e) - (m_u - f_s))) <> 0 and (m_u + 2 * ((f_s - (m_u - (m_u - f_s))) + ((f_tl + f_e) - (m_u - f_s)))) - m_u = 2 * ((f_s - (m_u - (m_u - f_s))) + ((f_tl + f_e) - (m_u - f_s))) and (f_w < 0) = (((f_s - (m_u - (m_u - f_s))) + ((f_tl + f_e) - (m_u - f_s))) < 0) then m_u := m_u + 2 * ((f_s - (m_u - (m_u - f_s))) + ((f_tl + f_e) - (m_u - f_s))); end if;
      elsif m_x = 0 or m_e = 0 then
        m_u := m_x * m_e + -m_hxs;
      else
        m_u := fdlibm_fma_wide(a => m_x, b => m_e, c => -m_hxs);
      end if;
      res := m_x - m_u; exit;
    end if;
    f_b := m_e - m_c;
    if abs(m_x) >= 1e-144 and abs(m_x) <= 1e144 and abs(f_b) >= 1e-144 and abs(f_b) <= 1e144 and abs(-m_c) <= 1e288 then
      f_p := m_x * f_b;
      f_ah := (m_x * 134217729 - (m_x * 134217729 - m_x));
      f_bh := (f_b * 134217729 - (f_b * 134217729 - f_b));
      f_e := (m_x - f_ah) * (f_b - f_bh) - (((f_p - f_ah * f_bh) - (m_x - f_ah) * f_bh) - f_ah * (f_b - f_bh));
      f_s := -m_c + f_p;
      f_tl := (-m_c - (f_s - (f_s - -m_c))) + (f_p - (f_s - -m_c));
      f_w := (f_tl - ((f_tl + f_e) - ((f_tl + f_e) - f_tl))) + (f_e - ((f_tl + f_e) - f_tl));
      m_e := f_s + (f_tl + f_e);
      if f_w <> 0 and ((f_s - (m_e - (m_e - f_s))) + ((f_tl + f_e) - (m_e - f_s))) <> 0 and (m_e + 2 * ((f_s - (m_e - (m_e - f_s))) + ((f_tl + f_e) - (m_e - f_s)))) - m_e = 2 * ((f_s - (m_e - (m_e - f_s))) + ((f_tl + f_e) - (m_e - f_s))) and (f_w < 0) = (((f_s - (m_e - (m_e - f_s))) + ((f_tl + f_e) - (m_e - f_s))) < 0) then m_e := m_e + 2 * ((f_s - (m_e - (m_e - f_s))) + ((f_tl + f_e) - (m_e - f_s))); end if;
    elsif m_x = 0 or f_b = 0 then
      m_e := m_x * f_b + -m_c;
    else
      m_e := fdlibm_fma_wide(a => m_x, b => f_b, c => -m_c);
    end if;
    m_e := m_e - m_hxs;
    if m_k = -1 then res := 0.5 * (m_x - m_e) - 0.5; exit; end if;
    if m_k = 1 then
      if m_x < -0.25 then res := -2 * (m_e - (m_x + 0.5)); exit; end if;
      res := 1 + 2 * (m_x - m_e); exit;
    end if;
    if m_k <= -2 or m_k > 56 then
      m_y := 1 - (m_e - m_x);
      if m_k = 1024 then
        if m_y >= 1 then res := 'Infinity'; exit; end if;
        m_y := m_y * 2 * 8.98846567431158e+307;
      else
        m_y := m_y * (('{2.2250738585072014e-308,4.1045368012983762e-289,7.571533991467358e-270,1.3967014978599092e-250,2.5764595078388533e-231,4.7527289157379e-212,8.767237396033612e-193,1.617269844780878e-173,2.983336292480083e-154,5.503284107318959e-135,1.0151767349262597e-115,1.8726705418768793e-96,3.454467422037778e-77,6.372367644529809e-58,1.1754943508222875e-38,2.168404344971009e-19,4,73786976294838210000,1.361129467683754e+39,2.5108406941546723e+58,4.631683569492648e+77,8.54394814368364e+96,1.5760802478557792e+116,2.9073548971824276e+135,5.363123171977039e+154,9.893216058924181e+173,1.824976247048878e+193,3.366486976990959e+212,6.210072369202836e+231,1.1455561567389984e+251,2.113178124542661e+270,3.89812560456e+289}'::float8[])[(((m_k) + 1022) >> 6) + 1] * ('{1,2,4,8,16,32,64,128,256,512,1024,2048,4096,8192,16384,32768,65536,131072,262144,524288,1048576,2097152,4194304,8388608,16777216,33554432,67108864,134217728,268435456,536870912,1073741824,2147483648,4294967296,8589934592,17179869184,34359738368,68719476736,137438953472,274877906944,549755813888,1099511627776,2199023255552,4398046511104,8796093022208,17592186044416,35184372088832,70368744177664,140737488355328,281474976710656,562949953421312,1125899906842624,2251799813685248,4503599627370496,9007199254740992,18014398509481984,36028797018963970,72057594037927940,144115188075855870,288230376151711740,576460752303423500,1152921504606847000,2305843009213694000,4611686018427388000,9223372036854776000}'::float8[])[(((m_k) + 1022) & 63) + 1]);
      end if;
      res := m_y - 1; exit;
    end if;
    if m_k < 20 then
      m_y := (1 - (('{2.2250738585072014e-308,4.1045368012983762e-289,7.571533991467358e-270,1.3967014978599092e-250,2.5764595078388533e-231,4.7527289157379e-212,8.767237396033612e-193,1.617269844780878e-173,2.983336292480083e-154,5.503284107318959e-135,1.0151767349262597e-115,1.8726705418768793e-96,3.454467422037778e-77,6.372367644529809e-58,1.1754943508222875e-38,2.168404344971009e-19,4,73786976294838210000,1.361129467683754e+39,2.5108406941546723e+58,4.631683569492648e+77,8.54394814368364e+96,1.5760802478557792e+116,2.9073548971824276e+135,5.363123171977039e+154,9.893216058924181e+173,1.824976247048878e+193,3.366486976990959e+212,6.210072369202836e+231,1.1455561567389984e+251,2.113178124542661e+270,3.89812560456e+289}'::float8[])[(((-m_k) + 1022) >> 6) + 1] * ('{1,2,4,8,16,32,64,128,256,512,1024,2048,4096,8192,16384,32768,65536,131072,262144,524288,1048576,2097152,4194304,8388608,16777216,33554432,67108864,134217728,268435456,536870912,1073741824,2147483648,4294967296,8589934592,17179869184,34359738368,68719476736,137438953472,274877906944,549755813888,1099511627776,2199023255552,4398046511104,8796093022208,17592186044416,35184372088832,70368744177664,140737488355328,281474976710656,562949953421312,1125899906842624,2251799813685248,4503599627370496,9007199254740992,18014398509481984,36028797018963970,72057594037927940,144115188075855870,288230376151711740,576460752303423500,1152921504606847000,2305843009213694000,4611686018427388000,9223372036854776000}'::float8[])[(((-m_k) + 1022) & 63) + 1])) - (m_e - m_x);
    else
      m_y := (m_x - (m_e + (('{2.2250738585072014e-308,4.1045368012983762e-289,7.571533991467358e-270,1.3967014978599092e-250,2.5764595078388533e-231,4.7527289157379e-212,8.767237396033612e-193,1.617269844780878e-173,2.983336292480083e-154,5.503284107318959e-135,1.0151767349262597e-115,1.8726705418768793e-96,3.454467422037778e-77,6.372367644529809e-58,1.1754943508222875e-38,2.168404344971009e-19,4,73786976294838210000,1.361129467683754e+39,2.5108406941546723e+58,4.631683569492648e+77,8.54394814368364e+96,1.5760802478557792e+116,2.9073548971824276e+135,5.363123171977039e+154,9.893216058924181e+173,1.824976247048878e+193,3.366486976990959e+212,6.210072369202836e+231,1.1455561567389984e+251,2.113178124542661e+270,3.89812560456e+289}'::float8[])[(((-m_k) + 1022) >> 6) + 1] * ('{1,2,4,8,16,32,64,128,256,512,1024,2048,4096,8192,16384,32768,65536,131072,262144,524288,1048576,2097152,4194304,8388608,16777216,33554432,67108864,134217728,268435456,536870912,1073741824,2147483648,4294967296,8589934592,17179869184,34359738368,68719476736,137438953472,274877906944,549755813888,1099511627776,2199023255552,4398046511104,8796093022208,17592186044416,35184372088832,70368744177664,140737488355328,281474976710656,562949953421312,1125899906842624,2251799813685248,4503599627370496,9007199254740992,18014398509481984,36028797018963970,72057594037927940,144115188075855870,288230376151711740,576460752303423500,1152921504606847000,2305843009213694000,4611686018427388000,9223372036854776000}'::float8[])[(((-m_k) + 1022) & 63) + 1]))) + 1;
    end if;
    res := m_y * (('{2.2250738585072014e-308,4.1045368012983762e-289,7.571533991467358e-270,1.3967014978599092e-250,2.5764595078388533e-231,4.7527289157379e-212,8.767237396033612e-193,1.617269844780878e-173,2.983336292480083e-154,5.503284107318959e-135,1.0151767349262597e-115,1.8726705418768793e-96,3.454467422037778e-77,6.372367644529809e-58,1.1754943508222875e-38,2.168404344971009e-19,4,73786976294838210000,1.361129467683754e+39,2.5108406941546723e+58,4.631683569492648e+77,8.54394814368364e+96,1.5760802478557792e+116,2.9073548971824276e+135,5.363123171977039e+154,9.893216058924181e+173,1.824976247048878e+193,3.366486976990959e+212,6.210072369202836e+231,1.1455561567389984e+251,2.113178124542661e+270,3.89812560456e+289}'::float8[])[(((m_k) + 1022) >> 6) + 1] * ('{1,2,4,8,16,32,64,128,256,512,1024,2048,4096,8192,16384,32768,65536,131072,262144,524288,1048576,2097152,4194304,8388608,16777216,33554432,67108864,134217728,268435456,536870912,1073741824,2147483648,4294967296,8589934592,17179869184,34359738368,68719476736,137438953472,274877906944,549755813888,1099511627776,2199023255552,4398046511104,8796093022208,17592186044416,35184372088832,70368744177664,140737488355328,281474976710656,562949953421312,1125899906842624,2251799813685248,4503599627370496,9007199254740992,18014398509481984,36028797018963970,72057594037927940,144115188075855870,288230376151711740,576460752303423500,1152921504606847000,2305843009213694000,4611686018427388000,9223372036854776000}'::float8[])[(((m_k) + 1022) & 63) + 1]); exit;
  end loop;

  return res;
end $$;
-- V8's log (ieee754.cc; Math.log). Setting x's exponent is an exact scaling by a power of two; dk × ln2_hi is exact
-- (11 by 32 bits), so its fused and unfused forms agree.
create function p3.fdlibm_log(x float8) returns float8 language plpgsql immutable as $$
declare f_a float8; f_b float8; f_c float8; f_p float8; f_ah float8; f_bh float8; f_e float8; f_s float8; f_tl float8; f_w float8; l_x float8; l_hx int; l_k int; l_i int; l_j int; l_f float8; l_s float8; l_z float8; l_w float8; l_r float8; l_t1 float8; l_t2 float8; l_hfsq float8; l_dk float8; l_u float8;
 res float8;
begin
  loop
    l_x := x;
    l_hx := (int8(float8send(l_x)) >> 32)::int;
    l_k := 0;
    if l_hx < 0x00100000 then
      if (l_hx & 2147483647) = 0 and (int8(float8send(l_x)) & 4294967295) = 0 then res := '-Infinity'; exit; end if;
      if l_hx < 0 then res := 'NaN'; exit; end if;
      l_k := -54;
      l_x := l_x * 1.80143985094819840000e+16;
      l_hx := (int8(float8send(l_x)) >> 32)::int;
    end if;
    if l_hx >= 0x7FF00000 then res := l_x; exit; end if;
    l_i := (((l_hx & 0x000FFFFF) + 0x95F64) & 0x100000) >> 20;
    l_x := l_x * (case when (1023 - (l_hx >> 20) - l_i) >= -1022 then (('{2.2250738585072014e-308,4.1045368012983762e-289,7.571533991467358e-270,1.3967014978599092e-250,2.5764595078388533e-231,4.7527289157379e-212,8.767237396033612e-193,1.617269844780878e-173,2.983336292480083e-154,5.503284107318959e-135,1.0151767349262597e-115,1.8726705418768793e-96,3.454467422037778e-77,6.372367644529809e-58,1.1754943508222875e-38,2.168404344971009e-19,4,73786976294838210000,1.361129467683754e+39,2.5108406941546723e+58,4.631683569492648e+77,8.54394814368364e+96,1.5760802478557792e+116,2.9073548971824276e+135,5.363123171977039e+154,9.893216058924181e+173,1.824976247048878e+193,3.366486976990959e+212,6.210072369202836e+231,1.1455561567389984e+251,2.113178124542661e+270,3.89812560456e+289}'::float8[])[(((1023 - (l_hx >> 20) - l_i) + 1022) >> 6) + 1] * ('{1,2,4,8,16,32,64,128,256,512,1024,2048,4096,8192,16384,32768,65536,131072,262144,524288,1048576,2097152,4194304,8388608,16777216,33554432,67108864,134217728,268435456,536870912,1073741824,2147483648,4294967296,8589934592,17179869184,34359738368,68719476736,137438953472,274877906944,549755813888,1099511627776,2199023255552,4398046511104,8796093022208,17592186044416,35184372088832,70368744177664,140737488355328,281474976710656,562949953421312,1125899906842624,2251799813685248,4503599627370496,9007199254740992,18014398509481984,36028797018963970,72057594037927940,144115188075855870,288230376151711740,576460752303423500,1152921504606847000,2305843009213694000,4611686018427388000,9223372036854776000}'::float8[])[(((1023 - (l_hx >> 20) - l_i) + 1022) & 63) + 1]) else 2.2250738585072014e-308 * ('{0.5,0.25,0.125,0.0625,0.03125,0.015625,0.0078125,0.00390625,0.001953125,0.0009765625,0.00048828125,0.000244140625,0.0001220703125,0.00006103515625,0.000030517578125,0.0000152587890625,0.00000762939453125,0.000003814697265625,0.0000019073486328125,9.5367431640625e-7,4.76837158203125e-7,2.384185791015625e-7,1.1920928955078125e-7,5.960464477539063e-8,2.9802322387695312e-8,1.4901161193847656e-8,7.450580596923828e-9,3.725290298461914e-9,1.862645149230957e-9,9.313225746154785e-10,4.656612873077393e-10,2.3283064365386963e-10,1.1641532182693481e-10,5.820766091346741e-11,2.9103830456733704e-11,1.4551915228366852e-11,7.275957614183426e-12,3.637978807091713e-12,1.8189894035458565e-12,9.094947017729282e-13,4.547473508864641e-13,2.2737367544323206e-13,1.1368683772161603e-13,5.684341886080802e-14,2.842170943040401e-14,1.4210854715202004e-14,7.105427357601002e-15,3.552713678800501e-15,1.7763568394002505e-15,8.881784197001252e-16,4.440892098500626e-16,2.220446049250313e-16}'::float8[])[-1022 - (1023 - (l_hx >> 20) - l_i)] end);
    l_k := l_k + ((l_hx >> 20) - 1023) + l_i;
    l_hx := l_hx & 0x000FFFFF;
    l_f := l_x - 1;
    l_dk := l_k;
    if (0x000FFFFF & (2 + l_hx)) < 3 then
      if l_f = 0 then
        if l_k = 0 then res := 0; exit; end if;
        res := l_dk * 6.93147180369123816490e-01 + l_dk * 1.90821492927058770002e-10; exit;
      end if;
      if abs((-0.33333333333333333)::float8) >= 1e-144 and abs((-0.33333333333333333)::float8) <= 1e144 and abs(l_f) >= 1e-144 and abs(l_f) <= 1e144 and abs((0.5)::float8) <= 1e288 then
        f_p := (-0.33333333333333333)::float8 * l_f;
        f_bh := (l_f * 134217729 - (l_f * 134217729 - l_f));
        f_e := ((-0.33333333333333333)::float8 - ((-0.33333333333333333)::float8 * 134217729 - ((-0.33333333333333333)::float8 * 134217729 - (-0.33333333333333333)::float8))) * (l_f - f_bh) - (((f_p - ((-0.33333333333333333)::float8 * 134217729 - ((-0.33333333333333333)::float8 * 134217729 - (-0.33333333333333333)::float8)) * f_bh) - ((-0.33333333333333333)::float8 - ((-0.33333333333333333)::float8 * 134217729 - ((-0.33333333333333333)::float8 * 134217729 - (-0.33333333333333333)::float8))) * f_bh) - ((-0.33333333333333333)::float8 * 134217729 - ((-0.33333333333333333)::float8 * 134217729 - (-0.33333333333333333)::float8)) * (l_f - f_bh));
        f_s := (0.5)::float8 + f_p;
        f_tl := ((0.5)::float8 - (f_s - (f_s - (0.5)::float8))) + (f_p - (f_s - (0.5)::float8));
        f_w := (f_tl - ((f_tl + f_e) - ((f_tl + f_e) - f_tl))) + (f_e - ((f_tl + f_e) - f_tl));
        l_u := f_s + (f_tl + f_e);
        if f_w <> 0 and ((f_s - (l_u - (l_u - f_s))) + ((f_tl + f_e) - (l_u - f_s))) <> 0 and (l_u + 2 * ((f_s - (l_u - (l_u - f_s))) + ((f_tl + f_e) - (l_u - f_s)))) - l_u = 2 * ((f_s - (l_u - (l_u - f_s))) + ((f_tl + f_e) - (l_u - f_s))) and (f_w < 0) = (((f_s - (l_u - (l_u - f_s))) + ((f_tl + f_e) - (l_u - f_s))) < 0) then l_u := l_u + 2 * ((f_s - (l_u - (l_u - f_s))) + ((f_tl + f_e) - (l_u - f_s))); end if;
      elsif (-0.33333333333333333)::float8 = 0 or l_f = 0 then
        l_u := (-0.33333333333333333)::float8 * l_f + (0.5)::float8;
      else
        l_u := fdlibm_fma_wide(a => (-0.33333333333333333)::float8, b => l_f, c => (0.5)::float8);
      end if;
      l_r := (l_f * l_f) * l_u;
      if l_k = 0 then res := l_f - l_r; exit; end if;
      if abs(-l_dk) >= 1e-144 and abs(-l_dk) <= 1e144 and abs((1.90821492927058770002e-10)::float8) >= 1e-144 and abs((1.90821492927058770002e-10)::float8) <= 1e144 and abs(l_r) <= 1e288 then
        f_p := -l_dk * (1.90821492927058770002e-10)::float8;
        f_ah := (-l_dk * 134217729 - (-l_dk * 134217729 - -l_dk));
        f_e := (-l_dk - f_ah) * ((1.90821492927058770002e-10)::float8 - ((1.90821492927058770002e-10)::float8 * 134217729 - ((1.90821492927058770002e-10)::float8 * 134217729 - (1.90821492927058770002e-10)::float8))) - (((f_p - f_ah * ((1.90821492927058770002e-10)::float8 * 134217729 - ((1.90821492927058770002e-10)::float8 * 134217729 - (1.90821492927058770002e-10)::float8))) - (-l_dk - f_ah) * ((1.90821492927058770002e-10)::float8 * 134217729 - ((1.90821492927058770002e-10)::float8 * 134217729 - (1.90821492927058770002e-10)::float8))) - f_ah * ((1.90821492927058770002e-10)::float8 - ((1.90821492927058770002e-10)::float8 * 134217729 - ((1.90821492927058770002e-10)::float8 * 134217729 - (1.90821492927058770002e-10)::float8))));
        f_s := l_r + f_p;
        f_tl := (l_r - (f_s - (f_s - l_r))) + (f_p - (f_s - l_r));
        f_w := (f_tl - ((f_tl + f_e) - ((f_tl + f_e) - f_tl))) + (f_e - ((f_tl + f_e) - f_tl));
        l_u := f_s + (f_tl + f_e);
        if f_w <> 0 and ((f_s - (l_u - (l_u - f_s))) + ((f_tl + f_e) - (l_u - f_s))) <> 0 and (l_u + 2 * ((f_s - (l_u - (l_u - f_s))) + ((f_tl + f_e) - (l_u - f_s)))) - l_u = 2 * ((f_s - (l_u - (l_u - f_s))) + ((f_tl + f_e) - (l_u - f_s))) and (f_w < 0) = (((f_s - (l_u - (l_u - f_s))) + ((f_tl + f_e) - (l_u - f_s))) < 0) then l_u := l_u + 2 * ((f_s - (l_u - (l_u - f_s))) + ((f_tl + f_e) - (l_u - f_s))); end if;
      elsif -l_dk = 0 or (1.90821492927058770002e-10)::float8 = 0 then
        l_u := -l_dk * (1.90821492927058770002e-10)::float8 + l_r;
      else
        l_u := fdlibm_fma_wide(a => -l_dk, b => (1.90821492927058770002e-10)::float8, c => l_r);
      end if;
      res := l_dk * 6.93147180369123816490e-01 - (l_u - l_f); exit;
    end if;
    l_s := l_f / (2 + l_f);
    l_z := l_s * l_s;
    l_i := l_hx - 0x6147A;
    l_w := l_z * l_z;
    l_j := 0x6B851 - l_hx;
    if abs(l_w) >= 1e-144 and abs(l_w) <= 1e144 and abs((1.531383769920937332e-01)::float8) >= 1e-144 and abs((1.531383769920937332e-01)::float8) <= 1e144 and abs((2.222219843214978396e-01)::float8) <= 1e288 then
      f_p := l_w * (1.531383769920937332e-01)::float8;
      f_ah := (l_w * 134217729 - (l_w * 134217729 - l_w));
      f_e := (l_w - f_ah) * ((1.531383769920937332e-01)::float8 - ((1.531383769920937332e-01)::float8 * 134217729 - ((1.531383769920937332e-01)::float8 * 134217729 - (1.531383769920937332e-01)::float8))) - (((f_p - f_ah * ((1.531383769920937332e-01)::float8 * 134217729 - ((1.531383769920937332e-01)::float8 * 134217729 - (1.531383769920937332e-01)::float8))) - (l_w - f_ah) * ((1.531383769920937332e-01)::float8 * 134217729 - ((1.531383769920937332e-01)::float8 * 134217729 - (1.531383769920937332e-01)::float8))) - f_ah * ((1.531383769920937332e-01)::float8 - ((1.531383769920937332e-01)::float8 * 134217729 - ((1.531383769920937332e-01)::float8 * 134217729 - (1.531383769920937332e-01)::float8))));
      f_s := (2.222219843214978396e-01)::float8 + f_p;
      f_tl := ((2.222219843214978396e-01)::float8 - (f_s - (f_s - (2.222219843214978396e-01)::float8))) + (f_p - (f_s - (2.222219843214978396e-01)::float8));
      f_w := (f_tl - ((f_tl + f_e) - ((f_tl + f_e) - f_tl))) + (f_e - ((f_tl + f_e) - f_tl));
      l_t1 := f_s + (f_tl + f_e);
      if f_w <> 0 and ((f_s - (l_t1 - (l_t1 - f_s))) + ((f_tl + f_e) - (l_t1 - f_s))) <> 0 and (l_t1 + 2 * ((f_s - (l_t1 - (l_t1 - f_s))) + ((f_tl + f_e) - (l_t1 - f_s)))) - l_t1 = 2 * ((f_s - (l_t1 - (l_t1 - f_s))) + ((f_tl + f_e) - (l_t1 - f_s))) and (f_w < 0) = (((f_s - (l_t1 - (l_t1 - f_s))) + ((f_tl + f_e) - (l_t1 - f_s))) < 0) then l_t1 := l_t1 + 2 * ((f_s - (l_t1 - (l_t1 - f_s))) + ((f_tl + f_e) - (l_t1 - f_s))); end if;
    elsif l_w = 0 or (1.531383769920937332e-01)::float8 = 0 then
      l_t1 := l_w * (1.531383769920937332e-01)::float8 + (2.222219843214978396e-01)::float8;
    else
      l_t1 := fdlibm_fma_wide(a => l_w, b => (1.531383769920937332e-01)::float8, c => (2.222219843214978396e-01)::float8);
    end if;
    if abs(l_w) >= 1e-144 and abs(l_w) <= 1e144 and abs(l_t1) >= 1e-144 and abs(l_t1) <= 1e144 and abs((3.999999999940941908e-01)::float8) <= 1e288 then
      f_p := l_w * l_t1;
      f_ah := (l_w * 134217729 - (l_w * 134217729 - l_w));
      f_bh := (l_t1 * 134217729 - (l_t1 * 134217729 - l_t1));
      f_e := (l_w - f_ah) * (l_t1 - f_bh) - (((f_p - f_ah * f_bh) - (l_w - f_ah) * f_bh) - f_ah * (l_t1 - f_bh));
      f_s := (3.999999999940941908e-01)::float8 + f_p;
      f_tl := ((3.999999999940941908e-01)::float8 - (f_s - (f_s - (3.999999999940941908e-01)::float8))) + (f_p - (f_s - (3.999999999940941908e-01)::float8));
      f_w := (f_tl - ((f_tl + f_e) - ((f_tl + f_e) - f_tl))) + (f_e - ((f_tl + f_e) - f_tl));
      l_t1 := f_s + (f_tl + f_e);
      if f_w <> 0 and ((f_s - (l_t1 - (l_t1 - f_s))) + ((f_tl + f_e) - (l_t1 - f_s))) <> 0 and (l_t1 + 2 * ((f_s - (l_t1 - (l_t1 - f_s))) + ((f_tl + f_e) - (l_t1 - f_s)))) - l_t1 = 2 * ((f_s - (l_t1 - (l_t1 - f_s))) + ((f_tl + f_e) - (l_t1 - f_s))) and (f_w < 0) = (((f_s - (l_t1 - (l_t1 - f_s))) + ((f_tl + f_e) - (l_t1 - f_s))) < 0) then l_t1 := l_t1 + 2 * ((f_s - (l_t1 - (l_t1 - f_s))) + ((f_tl + f_e) - (l_t1 - f_s))); end if;
    elsif l_w = 0 or l_t1 = 0 then
      l_t1 := l_w * l_t1 + (3.999999999940941908e-01)::float8;
    else
      l_t1 := fdlibm_fma_wide(a => l_w, b => l_t1, c => (3.999999999940941908e-01)::float8);
    end if;
    l_t1 := l_w * l_t1;
    if abs(l_w) >= 1e-144 and abs(l_w) <= 1e144 and abs((1.479819860511658591e-01)::float8) >= 1e-144 and abs((1.479819860511658591e-01)::float8) <= 1e144 and abs((1.818357216161805012e-01)::float8) <= 1e288 then
      f_p := l_w * (1.479819860511658591e-01)::float8;
      f_ah := (l_w * 134217729 - (l_w * 134217729 - l_w));
      f_e := (l_w - f_ah) * ((1.479819860511658591e-01)::float8 - ((1.479819860511658591e-01)::float8 * 134217729 - ((1.479819860511658591e-01)::float8 * 134217729 - (1.479819860511658591e-01)::float8))) - (((f_p - f_ah * ((1.479819860511658591e-01)::float8 * 134217729 - ((1.479819860511658591e-01)::float8 * 134217729 - (1.479819860511658591e-01)::float8))) - (l_w - f_ah) * ((1.479819860511658591e-01)::float8 * 134217729 - ((1.479819860511658591e-01)::float8 * 134217729 - (1.479819860511658591e-01)::float8))) - f_ah * ((1.479819860511658591e-01)::float8 - ((1.479819860511658591e-01)::float8 * 134217729 - ((1.479819860511658591e-01)::float8 * 134217729 - (1.479819860511658591e-01)::float8))));
      f_s := (1.818357216161805012e-01)::float8 + f_p;
      f_tl := ((1.818357216161805012e-01)::float8 - (f_s - (f_s - (1.818357216161805012e-01)::float8))) + (f_p - (f_s - (1.818357216161805012e-01)::float8));
      f_w := (f_tl - ((f_tl + f_e) - ((f_tl + f_e) - f_tl))) + (f_e - ((f_tl + f_e) - f_tl));
      l_t2 := f_s + (f_tl + f_e);
      if f_w <> 0 and ((f_s - (l_t2 - (l_t2 - f_s))) + ((f_tl + f_e) - (l_t2 - f_s))) <> 0 and (l_t2 + 2 * ((f_s - (l_t2 - (l_t2 - f_s))) + ((f_tl + f_e) - (l_t2 - f_s)))) - l_t2 = 2 * ((f_s - (l_t2 - (l_t2 - f_s))) + ((f_tl + f_e) - (l_t2 - f_s))) and (f_w < 0) = (((f_s - (l_t2 - (l_t2 - f_s))) + ((f_tl + f_e) - (l_t2 - f_s))) < 0) then l_t2 := l_t2 + 2 * ((f_s - (l_t2 - (l_t2 - f_s))) + ((f_tl + f_e) - (l_t2 - f_s))); end if;
    elsif l_w = 0 or (1.479819860511658591e-01)::float8 = 0 then
      l_t2 := l_w * (1.479819860511658591e-01)::float8 + (1.818357216161805012e-01)::float8;
    else
      l_t2 := fdlibm_fma_wide(a => l_w, b => (1.479819860511658591e-01)::float8, c => (1.818357216161805012e-01)::float8);
    end if;
    if abs(l_w) >= 1e-144 and abs(l_w) <= 1e144 and abs(l_t2) >= 1e-144 and abs(l_t2) <= 1e144 and abs((2.857142874366239149e-01)::float8) <= 1e288 then
      f_p := l_w * l_t2;
      f_ah := (l_w * 134217729 - (l_w * 134217729 - l_w));
      f_bh := (l_t2 * 134217729 - (l_t2 * 134217729 - l_t2));
      f_e := (l_w - f_ah) * (l_t2 - f_bh) - (((f_p - f_ah * f_bh) - (l_w - f_ah) * f_bh) - f_ah * (l_t2 - f_bh));
      f_s := (2.857142874366239149e-01)::float8 + f_p;
      f_tl := ((2.857142874366239149e-01)::float8 - (f_s - (f_s - (2.857142874366239149e-01)::float8))) + (f_p - (f_s - (2.857142874366239149e-01)::float8));
      f_w := (f_tl - ((f_tl + f_e) - ((f_tl + f_e) - f_tl))) + (f_e - ((f_tl + f_e) - f_tl));
      l_t2 := f_s + (f_tl + f_e);
      if f_w <> 0 and ((f_s - (l_t2 - (l_t2 - f_s))) + ((f_tl + f_e) - (l_t2 - f_s))) <> 0 and (l_t2 + 2 * ((f_s - (l_t2 - (l_t2 - f_s))) + ((f_tl + f_e) - (l_t2 - f_s)))) - l_t2 = 2 * ((f_s - (l_t2 - (l_t2 - f_s))) + ((f_tl + f_e) - (l_t2 - f_s))) and (f_w < 0) = (((f_s - (l_t2 - (l_t2 - f_s))) + ((f_tl + f_e) - (l_t2 - f_s))) < 0) then l_t2 := l_t2 + 2 * ((f_s - (l_t2 - (l_t2 - f_s))) + ((f_tl + f_e) - (l_t2 - f_s))); end if;
    elsif l_w = 0 or l_t2 = 0 then
      l_t2 := l_w * l_t2 + (2.857142874366239149e-01)::float8;
    else
      l_t2 := fdlibm_fma_wide(a => l_w, b => l_t2, c => (2.857142874366239149e-01)::float8);
    end if;
    if abs(l_w) >= 1e-144 and abs(l_w) <= 1e144 and abs(l_t2) >= 1e-144 and abs(l_t2) <= 1e144 and abs((6.666666666666735130e-01)::float8) <= 1e288 then
      f_p := l_w * l_t2;
      f_ah := (l_w * 134217729 - (l_w * 134217729 - l_w));
      f_bh := (l_t2 * 134217729 - (l_t2 * 134217729 - l_t2));
      f_e := (l_w - f_ah) * (l_t2 - f_bh) - (((f_p - f_ah * f_bh) - (l_w - f_ah) * f_bh) - f_ah * (l_t2 - f_bh));
      f_s := (6.666666666666735130e-01)::float8 + f_p;
      f_tl := ((6.666666666666735130e-01)::float8 - (f_s - (f_s - (6.666666666666735130e-01)::float8))) + (f_p - (f_s - (6.666666666666735130e-01)::float8));
      f_w := (f_tl - ((f_tl + f_e) - ((f_tl + f_e) - f_tl))) + (f_e - ((f_tl + f_e) - f_tl));
      l_t2 := f_s + (f_tl + f_e);
      if f_w <> 0 and ((f_s - (l_t2 - (l_t2 - f_s))) + ((f_tl + f_e) - (l_t2 - f_s))) <> 0 and (l_t2 + 2 * ((f_s - (l_t2 - (l_t2 - f_s))) + ((f_tl + f_e) - (l_t2 - f_s)))) - l_t2 = 2 * ((f_s - (l_t2 - (l_t2 - f_s))) + ((f_tl + f_e) - (l_t2 - f_s))) and (f_w < 0) = (((f_s - (l_t2 - (l_t2 - f_s))) + ((f_tl + f_e) - (l_t2 - f_s))) < 0) then l_t2 := l_t2 + 2 * ((f_s - (l_t2 - (l_t2 - f_s))) + ((f_tl + f_e) - (l_t2 - f_s))); end if;
    elsif l_w = 0 or l_t2 = 0 then
      l_t2 := l_w * l_t2 + (6.666666666666735130e-01)::float8;
    else
      l_t2 := fdlibm_fma_wide(a => l_w, b => l_t2, c => (6.666666666666735130e-01)::float8);
    end if;
    l_t2 := l_z * l_t2;
    l_i := l_i | l_j;
    l_r := l_t2 + l_t1;
    if l_i > 0 then
      l_hfsq := 0.5 * l_f * l_f;
      if l_k = 0 then
        f_b := l_hfsq + l_r;
        if abs(-l_s) >= 1e-144 and abs(-l_s) <= 1e144 and abs(f_b) >= 1e-144 and abs(f_b) <= 1e144 and abs(l_hfsq) <= 1e288 then
          f_p := -l_s * f_b;
          f_ah := (-l_s * 134217729 - (-l_s * 134217729 - -l_s));
          f_bh := (f_b * 134217729 - (f_b * 134217729 - f_b));
          f_e := (-l_s - f_ah) * (f_b - f_bh) - (((f_p - f_ah * f_bh) - (-l_s - f_ah) * f_bh) - f_ah * (f_b - f_bh));
          f_s := l_hfsq + f_p;
          f_tl := (l_hfsq - (f_s - (f_s - l_hfsq))) + (f_p - (f_s - l_hfsq));
          f_w := (f_tl - ((f_tl + f_e) - ((f_tl + f_e) - f_tl))) + (f_e - ((f_tl + f_e) - f_tl));
          l_u := f_s + (f_tl + f_e);
          if f_w <> 0 and ((f_s - (l_u - (l_u - f_s))) + ((f_tl + f_e) - (l_u - f_s))) <> 0 and (l_u + 2 * ((f_s - (l_u - (l_u - f_s))) + ((f_tl + f_e) - (l_u - f_s)))) - l_u = 2 * ((f_s - (l_u - (l_u - f_s))) + ((f_tl + f_e) - (l_u - f_s))) and (f_w < 0) = (((f_s - (l_u - (l_u - f_s))) + ((f_tl + f_e) - (l_u - f_s))) < 0) then l_u := l_u + 2 * ((f_s - (l_u - (l_u - f_s))) + ((f_tl + f_e) - (l_u - f_s))); end if;
        elsif -l_s = 0 or f_b = 0 then
          l_u := -l_s * f_b + l_hfsq;
        else
          l_u := fdlibm_fma_wide(a => -l_s, b => f_b, c => l_hfsq);
        end if;
        res := l_f - l_u; exit;
      end if;
      f_b := l_hfsq + l_r;
      f_c := l_dk * 1.90821492927058770002e-10;
      if abs(l_s) >= 1e-144 and abs(l_s) <= 1e144 and abs(f_b) >= 1e-144 and abs(f_b) <= 1e144 and abs(f_c) <= 1e288 then
        f_p := l_s * f_b;
        f_ah := (l_s * 134217729 - (l_s * 134217729 - l_s));
        f_bh := (f_b * 134217729 - (f_b * 134217729 - f_b));
        f_e := (l_s - f_ah) * (f_b - f_bh) - (((f_p - f_ah * f_bh) - (l_s - f_ah) * f_bh) - f_ah * (f_b - f_bh));
        f_s := f_c + f_p;
        f_tl := (f_c - (f_s - (f_s - f_c))) + (f_p - (f_s - f_c));
        f_w := (f_tl - ((f_tl + f_e) - ((f_tl + f_e) - f_tl))) + (f_e - ((f_tl + f_e) - f_tl));
        l_u := f_s + (f_tl + f_e);
        if f_w <> 0 and ((f_s - (l_u - (l_u - f_s))) + ((f_tl + f_e) - (l_u - f_s))) <> 0 and (l_u + 2 * ((f_s - (l_u - (l_u - f_s))) + ((f_tl + f_e) - (l_u - f_s)))) - l_u = 2 * ((f_s - (l_u - (l_u - f_s))) + ((f_tl + f_e) - (l_u - f_s))) and (f_w < 0) = (((f_s - (l_u - (l_u - f_s))) + ((f_tl + f_e) - (l_u - f_s))) < 0) then l_u := l_u + 2 * ((f_s - (l_u - (l_u - f_s))) + ((f_tl + f_e) - (l_u - f_s))); end if;
      elsif l_s = 0 or f_b = 0 then
        l_u := l_s * f_b + f_c;
      else
        l_u := fdlibm_fma_wide(a => l_s, b => f_b, c => f_c);
      end if;
      res := l_dk * 6.93147180369123816490e-01 - ((l_hfsq - l_u) - l_f); exit;
    end if;
    if l_k = 0 then
      f_b := l_f - l_r;
      if abs(-l_s) >= 1e-144 and abs(-l_s) <= 1e144 and abs(f_b) >= 1e-144 and abs(f_b) <= 1e144 and abs(l_f) <= 1e288 then
        f_p := -l_s * f_b;
        f_ah := (-l_s * 134217729 - (-l_s * 134217729 - -l_s));
        f_bh := (f_b * 134217729 - (f_b * 134217729 - f_b));
        f_e := (-l_s - f_ah) * (f_b - f_bh) - (((f_p - f_ah * f_bh) - (-l_s - f_ah) * f_bh) - f_ah * (f_b - f_bh));
        f_s := l_f + f_p;
        f_tl := (l_f - (f_s - (f_s - l_f))) + (f_p - (f_s - l_f));
        f_w := (f_tl - ((f_tl + f_e) - ((f_tl + f_e) - f_tl))) + (f_e - ((f_tl + f_e) - f_tl));
        l_u := f_s + (f_tl + f_e);
        if f_w <> 0 and ((f_s - (l_u - (l_u - f_s))) + ((f_tl + f_e) - (l_u - f_s))) <> 0 and (l_u + 2 * ((f_s - (l_u - (l_u - f_s))) + ((f_tl + f_e) - (l_u - f_s)))) - l_u = 2 * ((f_s - (l_u - (l_u - f_s))) + ((f_tl + f_e) - (l_u - f_s))) and (f_w < 0) = (((f_s - (l_u - (l_u - f_s))) + ((f_tl + f_e) - (l_u - f_s))) < 0) then l_u := l_u + 2 * ((f_s - (l_u - (l_u - f_s))) + ((f_tl + f_e) - (l_u - f_s))); end if;
      elsif -l_s = 0 or f_b = 0 then
        l_u := -l_s * f_b + l_f;
      else
        l_u := fdlibm_fma_wide(a => -l_s, b => f_b, c => l_f);
      end if;
      res := l_u; exit;
    end if;
    f_b := l_f - l_r;
    f_c := -(l_dk * 1.90821492927058770002e-10);
    if abs(l_s) >= 1e-144 and abs(l_s) <= 1e144 and abs(f_b) >= 1e-144 and abs(f_b) <= 1e144 and abs(f_c) <= 1e288 then
      f_p := l_s * f_b;
      f_ah := (l_s * 134217729 - (l_s * 134217729 - l_s));
      f_bh := (f_b * 134217729 - (f_b * 134217729 - f_b));
      f_e := (l_s - f_ah) * (f_b - f_bh) - (((f_p - f_ah * f_bh) - (l_s - f_ah) * f_bh) - f_ah * (f_b - f_bh));
      f_s := f_c + f_p;
      f_tl := (f_c - (f_s - (f_s - f_c))) + (f_p - (f_s - f_c));
      f_w := (f_tl - ((f_tl + f_e) - ((f_tl + f_e) - f_tl))) + (f_e - ((f_tl + f_e) - f_tl));
      l_u := f_s + (f_tl + f_e);
      if f_w <> 0 and ((f_s - (l_u - (l_u - f_s))) + ((f_tl + f_e) - (l_u - f_s))) <> 0 and (l_u + 2 * ((f_s - (l_u - (l_u - f_s))) + ((f_tl + f_e) - (l_u - f_s)))) - l_u = 2 * ((f_s - (l_u - (l_u - f_s))) + ((f_tl + f_e) - (l_u - f_s))) and (f_w < 0) = (((f_s - (l_u - (l_u - f_s))) + ((f_tl + f_e) - (l_u - f_s))) < 0) then l_u := l_u + 2 * ((f_s - (l_u - (l_u - f_s))) + ((f_tl + f_e) - (l_u - f_s))); end if;
    elsif l_s = 0 or f_b = 0 then
      l_u := l_s * f_b + f_c;
    else
      l_u := fdlibm_fma_wide(a => l_s, b => f_b, c => f_c);
    end if;
    res := l_dk * 6.93147180369123816490e-01 - (l_u - l_f); exit;
  end loop;

  return res;
end $$;
-- V8's log10 (ieee754.cc; Math.log10). Setting x's exponent is an exact scaling by a power of two; y × log10_2hi is
-- exact (11 by 40 bits), so its fused and unfused forms agree.
create function p3.fdlibm_log10(x float8) returns float8 language plpgsql immutable as $$
declare f_a float8; f_b float8; f_c float8; f_p float8; f_ah float8; f_bh float8; f_e float8; f_s float8; f_tl float8; f_w float8; l_x float8; l_hx int; l_k int; l_i int; l_j int; l_f float8; l_s float8; l_z float8; l_w float8; l_r float8; l_t1 float8; l_t2 float8; l_hfsq float8; l_dk float8; l_u float8;
 lg float8; hx int := (int8(float8send(x)) >> 32)::int; lx bigint := (int8(float8send(x)) & 4294967295); k int := 0; i int; y float8; u float8;
begin
  if hx < 0x00100000 then
    if (hx & 2147483647) = 0 and lx = 0 then return '-Infinity'; end if;
    if hx < 0 then return 'NaN'; end if;
    k := -54;
    x := x * 1.80143985094819840000e+16;
    hx := (int8(float8send(x)) >> 32)::int;
    lx := (int8(float8send(x)) & 4294967295);
  end if;
  if hx >= 0x7FF00000 then return x; end if;
  if hx = 0x3FF00000 and lx = 0 then return 0; end if;
  k := k + ((hx >> 20) - 1023);
  i := case when k < 0 then 1 else 0 end;
  x := x * (case when ((0x3FF - i) - (hx >> 20)) >= -1022 then (('{2.2250738585072014e-308,4.1045368012983762e-289,7.571533991467358e-270,1.3967014978599092e-250,2.5764595078388533e-231,4.7527289157379e-212,8.767237396033612e-193,1.617269844780878e-173,2.983336292480083e-154,5.503284107318959e-135,1.0151767349262597e-115,1.8726705418768793e-96,3.454467422037778e-77,6.372367644529809e-58,1.1754943508222875e-38,2.168404344971009e-19,4,73786976294838210000,1.361129467683754e+39,2.5108406941546723e+58,4.631683569492648e+77,8.54394814368364e+96,1.5760802478557792e+116,2.9073548971824276e+135,5.363123171977039e+154,9.893216058924181e+173,1.824976247048878e+193,3.366486976990959e+212,6.210072369202836e+231,1.1455561567389984e+251,2.113178124542661e+270,3.89812560456e+289}'::float8[])[((((0x3FF - i) - (hx >> 20)) + 1022) >> 6) + 1] * ('{1,2,4,8,16,32,64,128,256,512,1024,2048,4096,8192,16384,32768,65536,131072,262144,524288,1048576,2097152,4194304,8388608,16777216,33554432,67108864,134217728,268435456,536870912,1073741824,2147483648,4294967296,8589934592,17179869184,34359738368,68719476736,137438953472,274877906944,549755813888,1099511627776,2199023255552,4398046511104,8796093022208,17592186044416,35184372088832,70368744177664,140737488355328,281474976710656,562949953421312,1125899906842624,2251799813685248,4503599627370496,9007199254740992,18014398509481984,36028797018963970,72057594037927940,144115188075855870,288230376151711740,576460752303423500,1152921504606847000,2305843009213694000,4611686018427388000,9223372036854776000}'::float8[])[((((0x3FF - i) - (hx >> 20)) + 1022) & 63) + 1]) else 2.2250738585072014e-308 * ('{0.5,0.25,0.125,0.0625,0.03125,0.015625,0.0078125,0.00390625,0.001953125,0.0009765625,0.00048828125,0.000244140625,0.0001220703125,0.00006103515625,0.000030517578125,0.0000152587890625,0.00000762939453125,0.000003814697265625,0.0000019073486328125,9.5367431640625e-7,4.76837158203125e-7,2.384185791015625e-7,1.1920928955078125e-7,5.960464477539063e-8,2.9802322387695312e-8,1.4901161193847656e-8,7.450580596923828e-9,3.725290298461914e-9,1.862645149230957e-9,9.313225746154785e-10,4.656612873077393e-10,2.3283064365386963e-10,1.1641532182693481e-10,5.820766091346741e-11,2.9103830456733704e-11,1.4551915228366852e-11,7.275957614183426e-12,3.637978807091713e-12,1.8189894035458565e-12,9.094947017729282e-13,4.547473508864641e-13,2.2737367544323206e-13,1.1368683772161603e-13,5.684341886080802e-14,2.842170943040401e-14,1.4210854715202004e-14,7.105427357601002e-15,3.552713678800501e-15,1.7763568394002505e-15,8.881784197001252e-16,4.440892098500626e-16,2.220446049250313e-16}'::float8[])[-1022 - ((0x3FF - i) - (hx >> 20))] end);
  y := k + i;
  loop
    l_x := x;
    l_hx := (int8(float8send(l_x)) >> 32)::int;
    l_k := 0;
    if l_hx < 0x00100000 then
      if (l_hx & 2147483647) = 0 and (int8(float8send(l_x)) & 4294967295) = 0 then lg := '-Infinity'; exit; end if;
      if l_hx < 0 then lg := 'NaN'; exit; end if;
      l_k := -54;
      l_x := l_x * 1.80143985094819840000e+16;
      l_hx := (int8(float8send(l_x)) >> 32)::int;
    end if;
    if l_hx >= 0x7FF00000 then lg := l_x; exit; end if;
    l_i := (((l_hx & 0x000FFFFF) + 0x95F64) & 0x100000) >> 20;
    l_x := l_x * (case when (1023 - (l_hx >> 20) - l_i) >= -1022 then (('{2.2250738585072014e-308,4.1045368012983762e-289,7.571533991467358e-270,1.3967014978599092e-250,2.5764595078388533e-231,4.7527289157379e-212,8.767237396033612e-193,1.617269844780878e-173,2.983336292480083e-154,5.503284107318959e-135,1.0151767349262597e-115,1.8726705418768793e-96,3.454467422037778e-77,6.372367644529809e-58,1.1754943508222875e-38,2.168404344971009e-19,4,73786976294838210000,1.361129467683754e+39,2.5108406941546723e+58,4.631683569492648e+77,8.54394814368364e+96,1.5760802478557792e+116,2.9073548971824276e+135,5.363123171977039e+154,9.893216058924181e+173,1.824976247048878e+193,3.366486976990959e+212,6.210072369202836e+231,1.1455561567389984e+251,2.113178124542661e+270,3.89812560456e+289}'::float8[])[(((1023 - (l_hx >> 20) - l_i) + 1022) >> 6) + 1] * ('{1,2,4,8,16,32,64,128,256,512,1024,2048,4096,8192,16384,32768,65536,131072,262144,524288,1048576,2097152,4194304,8388608,16777216,33554432,67108864,134217728,268435456,536870912,1073741824,2147483648,4294967296,8589934592,17179869184,34359738368,68719476736,137438953472,274877906944,549755813888,1099511627776,2199023255552,4398046511104,8796093022208,17592186044416,35184372088832,70368744177664,140737488355328,281474976710656,562949953421312,1125899906842624,2251799813685248,4503599627370496,9007199254740992,18014398509481984,36028797018963970,72057594037927940,144115188075855870,288230376151711740,576460752303423500,1152921504606847000,2305843009213694000,4611686018427388000,9223372036854776000}'::float8[])[(((1023 - (l_hx >> 20) - l_i) + 1022) & 63) + 1]) else 2.2250738585072014e-308 * ('{0.5,0.25,0.125,0.0625,0.03125,0.015625,0.0078125,0.00390625,0.001953125,0.0009765625,0.00048828125,0.000244140625,0.0001220703125,0.00006103515625,0.000030517578125,0.0000152587890625,0.00000762939453125,0.000003814697265625,0.0000019073486328125,9.5367431640625e-7,4.76837158203125e-7,2.384185791015625e-7,1.1920928955078125e-7,5.960464477539063e-8,2.9802322387695312e-8,1.4901161193847656e-8,7.450580596923828e-9,3.725290298461914e-9,1.862645149230957e-9,9.313225746154785e-10,4.656612873077393e-10,2.3283064365386963e-10,1.1641532182693481e-10,5.820766091346741e-11,2.9103830456733704e-11,1.4551915228366852e-11,7.275957614183426e-12,3.637978807091713e-12,1.8189894035458565e-12,9.094947017729282e-13,4.547473508864641e-13,2.2737367544323206e-13,1.1368683772161603e-13,5.684341886080802e-14,2.842170943040401e-14,1.4210854715202004e-14,7.105427357601002e-15,3.552713678800501e-15,1.7763568394002505e-15,8.881784197001252e-16,4.440892098500626e-16,2.220446049250313e-16}'::float8[])[-1022 - (1023 - (l_hx >> 20) - l_i)] end);
    l_k := l_k + ((l_hx >> 20) - 1023) + l_i;
    l_hx := l_hx & 0x000FFFFF;
    l_f := l_x - 1;
    l_dk := l_k;
    if (0x000FFFFF & (2 + l_hx)) < 3 then
      if l_f = 0 then
        if l_k = 0 then lg := 0; exit; end if;
        lg := l_dk * 6.93147180369123816490e-01 + l_dk * 1.90821492927058770002e-10; exit;
      end if;
      if abs((-0.33333333333333333)::float8) >= 1e-144 and abs((-0.33333333333333333)::float8) <= 1e144 and abs(l_f) >= 1e-144 and abs(l_f) <= 1e144 and abs((0.5)::float8) <= 1e288 then
        f_p := (-0.33333333333333333)::float8 * l_f;
        f_bh := (l_f * 134217729 - (l_f * 134217729 - l_f));
        f_e := ((-0.33333333333333333)::float8 - ((-0.33333333333333333)::float8 * 134217729 - ((-0.33333333333333333)::float8 * 134217729 - (-0.33333333333333333)::float8))) * (l_f - f_bh) - (((f_p - ((-0.33333333333333333)::float8 * 134217729 - ((-0.33333333333333333)::float8 * 134217729 - (-0.33333333333333333)::float8)) * f_bh) - ((-0.33333333333333333)::float8 - ((-0.33333333333333333)::float8 * 134217729 - ((-0.33333333333333333)::float8 * 134217729 - (-0.33333333333333333)::float8))) * f_bh) - ((-0.33333333333333333)::float8 * 134217729 - ((-0.33333333333333333)::float8 * 134217729 - (-0.33333333333333333)::float8)) * (l_f - f_bh));
        f_s := (0.5)::float8 + f_p;
        f_tl := ((0.5)::float8 - (f_s - (f_s - (0.5)::float8))) + (f_p - (f_s - (0.5)::float8));
        f_w := (f_tl - ((f_tl + f_e) - ((f_tl + f_e) - f_tl))) + (f_e - ((f_tl + f_e) - f_tl));
        l_u := f_s + (f_tl + f_e);
        if f_w <> 0 and ((f_s - (l_u - (l_u - f_s))) + ((f_tl + f_e) - (l_u - f_s))) <> 0 and (l_u + 2 * ((f_s - (l_u - (l_u - f_s))) + ((f_tl + f_e) - (l_u - f_s)))) - l_u = 2 * ((f_s - (l_u - (l_u - f_s))) + ((f_tl + f_e) - (l_u - f_s))) and (f_w < 0) = (((f_s - (l_u - (l_u - f_s))) + ((f_tl + f_e) - (l_u - f_s))) < 0) then l_u := l_u + 2 * ((f_s - (l_u - (l_u - f_s))) + ((f_tl + f_e) - (l_u - f_s))); end if;
      elsif (-0.33333333333333333)::float8 = 0 or l_f = 0 then
        l_u := (-0.33333333333333333)::float8 * l_f + (0.5)::float8;
      else
        l_u := fdlibm_fma_wide(a => (-0.33333333333333333)::float8, b => l_f, c => (0.5)::float8);
      end if;
      l_r := (l_f * l_f) * l_u;
      if l_k = 0 then lg := l_f - l_r; exit; end if;
      if abs(-l_dk) >= 1e-144 and abs(-l_dk) <= 1e144 and abs((1.90821492927058770002e-10)::float8) >= 1e-144 and abs((1.90821492927058770002e-10)::float8) <= 1e144 and abs(l_r) <= 1e288 then
        f_p := -l_dk * (1.90821492927058770002e-10)::float8;
        f_ah := (-l_dk * 134217729 - (-l_dk * 134217729 - -l_dk));
        f_e := (-l_dk - f_ah) * ((1.90821492927058770002e-10)::float8 - ((1.90821492927058770002e-10)::float8 * 134217729 - ((1.90821492927058770002e-10)::float8 * 134217729 - (1.90821492927058770002e-10)::float8))) - (((f_p - f_ah * ((1.90821492927058770002e-10)::float8 * 134217729 - ((1.90821492927058770002e-10)::float8 * 134217729 - (1.90821492927058770002e-10)::float8))) - (-l_dk - f_ah) * ((1.90821492927058770002e-10)::float8 * 134217729 - ((1.90821492927058770002e-10)::float8 * 134217729 - (1.90821492927058770002e-10)::float8))) - f_ah * ((1.90821492927058770002e-10)::float8 - ((1.90821492927058770002e-10)::float8 * 134217729 - ((1.90821492927058770002e-10)::float8 * 134217729 - (1.90821492927058770002e-10)::float8))));
        f_s := l_r + f_p;
        f_tl := (l_r - (f_s - (f_s - l_r))) + (f_p - (f_s - l_r));
        f_w := (f_tl - ((f_tl + f_e) - ((f_tl + f_e) - f_tl))) + (f_e - ((f_tl + f_e) - f_tl));
        l_u := f_s + (f_tl + f_e);
        if f_w <> 0 and ((f_s - (l_u - (l_u - f_s))) + ((f_tl + f_e) - (l_u - f_s))) <> 0 and (l_u + 2 * ((f_s - (l_u - (l_u - f_s))) + ((f_tl + f_e) - (l_u - f_s)))) - l_u = 2 * ((f_s - (l_u - (l_u - f_s))) + ((f_tl + f_e) - (l_u - f_s))) and (f_w < 0) = (((f_s - (l_u - (l_u - f_s))) + ((f_tl + f_e) - (l_u - f_s))) < 0) then l_u := l_u + 2 * ((f_s - (l_u - (l_u - f_s))) + ((f_tl + f_e) - (l_u - f_s))); end if;
      elsif -l_dk = 0 or (1.90821492927058770002e-10)::float8 = 0 then
        l_u := -l_dk * (1.90821492927058770002e-10)::float8 + l_r;
      else
        l_u := fdlibm_fma_wide(a => -l_dk, b => (1.90821492927058770002e-10)::float8, c => l_r);
      end if;
      lg := l_dk * 6.93147180369123816490e-01 - (l_u - l_f); exit;
    end if;
    l_s := l_f / (2 + l_f);
    l_z := l_s * l_s;
    l_i := l_hx - 0x6147A;
    l_w := l_z * l_z;
    l_j := 0x6B851 - l_hx;
    if abs(l_w) >= 1e-144 and abs(l_w) <= 1e144 and abs((1.531383769920937332e-01)::float8) >= 1e-144 and abs((1.531383769920937332e-01)::float8) <= 1e144 and abs((2.222219843214978396e-01)::float8) <= 1e288 then
      f_p := l_w * (1.531383769920937332e-01)::float8;
      f_ah := (l_w * 134217729 - (l_w * 134217729 - l_w));
      f_e := (l_w - f_ah) * ((1.531383769920937332e-01)::float8 - ((1.531383769920937332e-01)::float8 * 134217729 - ((1.531383769920937332e-01)::float8 * 134217729 - (1.531383769920937332e-01)::float8))) - (((f_p - f_ah * ((1.531383769920937332e-01)::float8 * 134217729 - ((1.531383769920937332e-01)::float8 * 134217729 - (1.531383769920937332e-01)::float8))) - (l_w - f_ah) * ((1.531383769920937332e-01)::float8 * 134217729 - ((1.531383769920937332e-01)::float8 * 134217729 - (1.531383769920937332e-01)::float8))) - f_ah * ((1.531383769920937332e-01)::float8 - ((1.531383769920937332e-01)::float8 * 134217729 - ((1.531383769920937332e-01)::float8 * 134217729 - (1.531383769920937332e-01)::float8))));
      f_s := (2.222219843214978396e-01)::float8 + f_p;
      f_tl := ((2.222219843214978396e-01)::float8 - (f_s - (f_s - (2.222219843214978396e-01)::float8))) + (f_p - (f_s - (2.222219843214978396e-01)::float8));
      f_w := (f_tl - ((f_tl + f_e) - ((f_tl + f_e) - f_tl))) + (f_e - ((f_tl + f_e) - f_tl));
      l_t1 := f_s + (f_tl + f_e);
      if f_w <> 0 and ((f_s - (l_t1 - (l_t1 - f_s))) + ((f_tl + f_e) - (l_t1 - f_s))) <> 0 and (l_t1 + 2 * ((f_s - (l_t1 - (l_t1 - f_s))) + ((f_tl + f_e) - (l_t1 - f_s)))) - l_t1 = 2 * ((f_s - (l_t1 - (l_t1 - f_s))) + ((f_tl + f_e) - (l_t1 - f_s))) and (f_w < 0) = (((f_s - (l_t1 - (l_t1 - f_s))) + ((f_tl + f_e) - (l_t1 - f_s))) < 0) then l_t1 := l_t1 + 2 * ((f_s - (l_t1 - (l_t1 - f_s))) + ((f_tl + f_e) - (l_t1 - f_s))); end if;
    elsif l_w = 0 or (1.531383769920937332e-01)::float8 = 0 then
      l_t1 := l_w * (1.531383769920937332e-01)::float8 + (2.222219843214978396e-01)::float8;
    else
      l_t1 := fdlibm_fma_wide(a => l_w, b => (1.531383769920937332e-01)::float8, c => (2.222219843214978396e-01)::float8);
    end if;
    if abs(l_w) >= 1e-144 and abs(l_w) <= 1e144 and abs(l_t1) >= 1e-144 and abs(l_t1) <= 1e144 and abs((3.999999999940941908e-01)::float8) <= 1e288 then
      f_p := l_w * l_t1;
      f_ah := (l_w * 134217729 - (l_w * 134217729 - l_w));
      f_bh := (l_t1 * 134217729 - (l_t1 * 134217729 - l_t1));
      f_e := (l_w - f_ah) * (l_t1 - f_bh) - (((f_p - f_ah * f_bh) - (l_w - f_ah) * f_bh) - f_ah * (l_t1 - f_bh));
      f_s := (3.999999999940941908e-01)::float8 + f_p;
      f_tl := ((3.999999999940941908e-01)::float8 - (f_s - (f_s - (3.999999999940941908e-01)::float8))) + (f_p - (f_s - (3.999999999940941908e-01)::float8));
      f_w := (f_tl - ((f_tl + f_e) - ((f_tl + f_e) - f_tl))) + (f_e - ((f_tl + f_e) - f_tl));
      l_t1 := f_s + (f_tl + f_e);
      if f_w <> 0 and ((f_s - (l_t1 - (l_t1 - f_s))) + ((f_tl + f_e) - (l_t1 - f_s))) <> 0 and (l_t1 + 2 * ((f_s - (l_t1 - (l_t1 - f_s))) + ((f_tl + f_e) - (l_t1 - f_s)))) - l_t1 = 2 * ((f_s - (l_t1 - (l_t1 - f_s))) + ((f_tl + f_e) - (l_t1 - f_s))) and (f_w < 0) = (((f_s - (l_t1 - (l_t1 - f_s))) + ((f_tl + f_e) - (l_t1 - f_s))) < 0) then l_t1 := l_t1 + 2 * ((f_s - (l_t1 - (l_t1 - f_s))) + ((f_tl + f_e) - (l_t1 - f_s))); end if;
    elsif l_w = 0 or l_t1 = 0 then
      l_t1 := l_w * l_t1 + (3.999999999940941908e-01)::float8;
    else
      l_t1 := fdlibm_fma_wide(a => l_w, b => l_t1, c => (3.999999999940941908e-01)::float8);
    end if;
    l_t1 := l_w * l_t1;
    if abs(l_w) >= 1e-144 and abs(l_w) <= 1e144 and abs((1.479819860511658591e-01)::float8) >= 1e-144 and abs((1.479819860511658591e-01)::float8) <= 1e144 and abs((1.818357216161805012e-01)::float8) <= 1e288 then
      f_p := l_w * (1.479819860511658591e-01)::float8;
      f_ah := (l_w * 134217729 - (l_w * 134217729 - l_w));
      f_e := (l_w - f_ah) * ((1.479819860511658591e-01)::float8 - ((1.479819860511658591e-01)::float8 * 134217729 - ((1.479819860511658591e-01)::float8 * 134217729 - (1.479819860511658591e-01)::float8))) - (((f_p - f_ah * ((1.479819860511658591e-01)::float8 * 134217729 - ((1.479819860511658591e-01)::float8 * 134217729 - (1.479819860511658591e-01)::float8))) - (l_w - f_ah) * ((1.479819860511658591e-01)::float8 * 134217729 - ((1.479819860511658591e-01)::float8 * 134217729 - (1.479819860511658591e-01)::float8))) - f_ah * ((1.479819860511658591e-01)::float8 - ((1.479819860511658591e-01)::float8 * 134217729 - ((1.479819860511658591e-01)::float8 * 134217729 - (1.479819860511658591e-01)::float8))));
      f_s := (1.818357216161805012e-01)::float8 + f_p;
      f_tl := ((1.818357216161805012e-01)::float8 - (f_s - (f_s - (1.818357216161805012e-01)::float8))) + (f_p - (f_s - (1.818357216161805012e-01)::float8));
      f_w := (f_tl - ((f_tl + f_e) - ((f_tl + f_e) - f_tl))) + (f_e - ((f_tl + f_e) - f_tl));
      l_t2 := f_s + (f_tl + f_e);
      if f_w <> 0 and ((f_s - (l_t2 - (l_t2 - f_s))) + ((f_tl + f_e) - (l_t2 - f_s))) <> 0 and (l_t2 + 2 * ((f_s - (l_t2 - (l_t2 - f_s))) + ((f_tl + f_e) - (l_t2 - f_s)))) - l_t2 = 2 * ((f_s - (l_t2 - (l_t2 - f_s))) + ((f_tl + f_e) - (l_t2 - f_s))) and (f_w < 0) = (((f_s - (l_t2 - (l_t2 - f_s))) + ((f_tl + f_e) - (l_t2 - f_s))) < 0) then l_t2 := l_t2 + 2 * ((f_s - (l_t2 - (l_t2 - f_s))) + ((f_tl + f_e) - (l_t2 - f_s))); end if;
    elsif l_w = 0 or (1.479819860511658591e-01)::float8 = 0 then
      l_t2 := l_w * (1.479819860511658591e-01)::float8 + (1.818357216161805012e-01)::float8;
    else
      l_t2 := fdlibm_fma_wide(a => l_w, b => (1.479819860511658591e-01)::float8, c => (1.818357216161805012e-01)::float8);
    end if;
    if abs(l_w) >= 1e-144 and abs(l_w) <= 1e144 and abs(l_t2) >= 1e-144 and abs(l_t2) <= 1e144 and abs((2.857142874366239149e-01)::float8) <= 1e288 then
      f_p := l_w * l_t2;
      f_ah := (l_w * 134217729 - (l_w * 134217729 - l_w));
      f_bh := (l_t2 * 134217729 - (l_t2 * 134217729 - l_t2));
      f_e := (l_w - f_ah) * (l_t2 - f_bh) - (((f_p - f_ah * f_bh) - (l_w - f_ah) * f_bh) - f_ah * (l_t2 - f_bh));
      f_s := (2.857142874366239149e-01)::float8 + f_p;
      f_tl := ((2.857142874366239149e-01)::float8 - (f_s - (f_s - (2.857142874366239149e-01)::float8))) + (f_p - (f_s - (2.857142874366239149e-01)::float8));
      f_w := (f_tl - ((f_tl + f_e) - ((f_tl + f_e) - f_tl))) + (f_e - ((f_tl + f_e) - f_tl));
      l_t2 := f_s + (f_tl + f_e);
      if f_w <> 0 and ((f_s - (l_t2 - (l_t2 - f_s))) + ((f_tl + f_e) - (l_t2 - f_s))) <> 0 and (l_t2 + 2 * ((f_s - (l_t2 - (l_t2 - f_s))) + ((f_tl + f_e) - (l_t2 - f_s)))) - l_t2 = 2 * ((f_s - (l_t2 - (l_t2 - f_s))) + ((f_tl + f_e) - (l_t2 - f_s))) and (f_w < 0) = (((f_s - (l_t2 - (l_t2 - f_s))) + ((f_tl + f_e) - (l_t2 - f_s))) < 0) then l_t2 := l_t2 + 2 * ((f_s - (l_t2 - (l_t2 - f_s))) + ((f_tl + f_e) - (l_t2 - f_s))); end if;
    elsif l_w = 0 or l_t2 = 0 then
      l_t2 := l_w * l_t2 + (2.857142874366239149e-01)::float8;
    else
      l_t2 := fdlibm_fma_wide(a => l_w, b => l_t2, c => (2.857142874366239149e-01)::float8);
    end if;
    if abs(l_w) >= 1e-144 and abs(l_w) <= 1e144 and abs(l_t2) >= 1e-144 and abs(l_t2) <= 1e144 and abs((6.666666666666735130e-01)::float8) <= 1e288 then
      f_p := l_w * l_t2;
      f_ah := (l_w * 134217729 - (l_w * 134217729 - l_w));
      f_bh := (l_t2 * 134217729 - (l_t2 * 134217729 - l_t2));
      f_e := (l_w - f_ah) * (l_t2 - f_bh) - (((f_p - f_ah * f_bh) - (l_w - f_ah) * f_bh) - f_ah * (l_t2 - f_bh));
      f_s := (6.666666666666735130e-01)::float8 + f_p;
      f_tl := ((6.666666666666735130e-01)::float8 - (f_s - (f_s - (6.666666666666735130e-01)::float8))) + (f_p - (f_s - (6.666666666666735130e-01)::float8));
      f_w := (f_tl - ((f_tl + f_e) - ((f_tl + f_e) - f_tl))) + (f_e - ((f_tl + f_e) - f_tl));
      l_t2 := f_s + (f_tl + f_e);
      if f_w <> 0 and ((f_s - (l_t2 - (l_t2 - f_s))) + ((f_tl + f_e) - (l_t2 - f_s))) <> 0 and (l_t2 + 2 * ((f_s - (l_t2 - (l_t2 - f_s))) + ((f_tl + f_e) - (l_t2 - f_s)))) - l_t2 = 2 * ((f_s - (l_t2 - (l_t2 - f_s))) + ((f_tl + f_e) - (l_t2 - f_s))) and (f_w < 0) = (((f_s - (l_t2 - (l_t2 - f_s))) + ((f_tl + f_e) - (l_t2 - f_s))) < 0) then l_t2 := l_t2 + 2 * ((f_s - (l_t2 - (l_t2 - f_s))) + ((f_tl + f_e) - (l_t2 - f_s))); end if;
    elsif l_w = 0 or l_t2 = 0 then
      l_t2 := l_w * l_t2 + (6.666666666666735130e-01)::float8;
    else
      l_t2 := fdlibm_fma_wide(a => l_w, b => l_t2, c => (6.666666666666735130e-01)::float8);
    end if;
    l_t2 := l_z * l_t2;
    l_i := l_i | l_j;
    l_r := l_t2 + l_t1;
    if l_i > 0 then
      l_hfsq := 0.5 * l_f * l_f;
      if l_k = 0 then
        f_b := l_hfsq + l_r;
        if abs(-l_s) >= 1e-144 and abs(-l_s) <= 1e144 and abs(f_b) >= 1e-144 and abs(f_b) <= 1e144 and abs(l_hfsq) <= 1e288 then
          f_p := -l_s * f_b;
          f_ah := (-l_s * 134217729 - (-l_s * 134217729 - -l_s));
          f_bh := (f_b * 134217729 - (f_b * 134217729 - f_b));
          f_e := (-l_s - f_ah) * (f_b - f_bh) - (((f_p - f_ah * f_bh) - (-l_s - f_ah) * f_bh) - f_ah * (f_b - f_bh));
          f_s := l_hfsq + f_p;
          f_tl := (l_hfsq - (f_s - (f_s - l_hfsq))) + (f_p - (f_s - l_hfsq));
          f_w := (f_tl - ((f_tl + f_e) - ((f_tl + f_e) - f_tl))) + (f_e - ((f_tl + f_e) - f_tl));
          l_u := f_s + (f_tl + f_e);
          if f_w <> 0 and ((f_s - (l_u - (l_u - f_s))) + ((f_tl + f_e) - (l_u - f_s))) <> 0 and (l_u + 2 * ((f_s - (l_u - (l_u - f_s))) + ((f_tl + f_e) - (l_u - f_s)))) - l_u = 2 * ((f_s - (l_u - (l_u - f_s))) + ((f_tl + f_e) - (l_u - f_s))) and (f_w < 0) = (((f_s - (l_u - (l_u - f_s))) + ((f_tl + f_e) - (l_u - f_s))) < 0) then l_u := l_u + 2 * ((f_s - (l_u - (l_u - f_s))) + ((f_tl + f_e) - (l_u - f_s))); end if;
        elsif -l_s = 0 or f_b = 0 then
          l_u := -l_s * f_b + l_hfsq;
        else
          l_u := fdlibm_fma_wide(a => -l_s, b => f_b, c => l_hfsq);
        end if;
        lg := l_f - l_u; exit;
      end if;
      f_b := l_hfsq + l_r;
      f_c := l_dk * 1.90821492927058770002e-10;
      if abs(l_s) >= 1e-144 and abs(l_s) <= 1e144 and abs(f_b) >= 1e-144 and abs(f_b) <= 1e144 and abs(f_c) <= 1e288 then
        f_p := l_s * f_b;
        f_ah := (l_s * 134217729 - (l_s * 134217729 - l_s));
        f_bh := (f_b * 134217729 - (f_b * 134217729 - f_b));
        f_e := (l_s - f_ah) * (f_b - f_bh) - (((f_p - f_ah * f_bh) - (l_s - f_ah) * f_bh) - f_ah * (f_b - f_bh));
        f_s := f_c + f_p;
        f_tl := (f_c - (f_s - (f_s - f_c))) + (f_p - (f_s - f_c));
        f_w := (f_tl - ((f_tl + f_e) - ((f_tl + f_e) - f_tl))) + (f_e - ((f_tl + f_e) - f_tl));
        l_u := f_s + (f_tl + f_e);
        if f_w <> 0 and ((f_s - (l_u - (l_u - f_s))) + ((f_tl + f_e) - (l_u - f_s))) <> 0 and (l_u + 2 * ((f_s - (l_u - (l_u - f_s))) + ((f_tl + f_e) - (l_u - f_s)))) - l_u = 2 * ((f_s - (l_u - (l_u - f_s))) + ((f_tl + f_e) - (l_u - f_s))) and (f_w < 0) = (((f_s - (l_u - (l_u - f_s))) + ((f_tl + f_e) - (l_u - f_s))) < 0) then l_u := l_u + 2 * ((f_s - (l_u - (l_u - f_s))) + ((f_tl + f_e) - (l_u - f_s))); end if;
      elsif l_s = 0 or f_b = 0 then
        l_u := l_s * f_b + f_c;
      else
        l_u := fdlibm_fma_wide(a => l_s, b => f_b, c => f_c);
      end if;
      lg := l_dk * 6.93147180369123816490e-01 - ((l_hfsq - l_u) - l_f); exit;
    end if;
    if l_k = 0 then
      f_b := l_f - l_r;
      if abs(-l_s) >= 1e-144 and abs(-l_s) <= 1e144 and abs(f_b) >= 1e-144 and abs(f_b) <= 1e144 and abs(l_f) <= 1e288 then
        f_p := -l_s * f_b;
        f_ah := (-l_s * 134217729 - (-l_s * 134217729 - -l_s));
        f_bh := (f_b * 134217729 - (f_b * 134217729 - f_b));
        f_e := (-l_s - f_ah) * (f_b - f_bh) - (((f_p - f_ah * f_bh) - (-l_s - f_ah) * f_bh) - f_ah * (f_b - f_bh));
        f_s := l_f + f_p;
        f_tl := (l_f - (f_s - (f_s - l_f))) + (f_p - (f_s - l_f));
        f_w := (f_tl - ((f_tl + f_e) - ((f_tl + f_e) - f_tl))) + (f_e - ((f_tl + f_e) - f_tl));
        l_u := f_s + (f_tl + f_e);
        if f_w <> 0 and ((f_s - (l_u - (l_u - f_s))) + ((f_tl + f_e) - (l_u - f_s))) <> 0 and (l_u + 2 * ((f_s - (l_u - (l_u - f_s))) + ((f_tl + f_e) - (l_u - f_s)))) - l_u = 2 * ((f_s - (l_u - (l_u - f_s))) + ((f_tl + f_e) - (l_u - f_s))) and (f_w < 0) = (((f_s - (l_u - (l_u - f_s))) + ((f_tl + f_e) - (l_u - f_s))) < 0) then l_u := l_u + 2 * ((f_s - (l_u - (l_u - f_s))) + ((f_tl + f_e) - (l_u - f_s))); end if;
      elsif -l_s = 0 or f_b = 0 then
        l_u := -l_s * f_b + l_f;
      else
        l_u := fdlibm_fma_wide(a => -l_s, b => f_b, c => l_f);
      end if;
      lg := l_u; exit;
    end if;
    f_b := l_f - l_r;
    f_c := -(l_dk * 1.90821492927058770002e-10);
    if abs(l_s) >= 1e-144 and abs(l_s) <= 1e144 and abs(f_b) >= 1e-144 and abs(f_b) <= 1e144 and abs(f_c) <= 1e288 then
      f_p := l_s * f_b;
      f_ah := (l_s * 134217729 - (l_s * 134217729 - l_s));
      f_bh := (f_b * 134217729 - (f_b * 134217729 - f_b));
      f_e := (l_s - f_ah) * (f_b - f_bh) - (((f_p - f_ah * f_bh) - (l_s - f_ah) * f_bh) - f_ah * (f_b - f_bh));
      f_s := f_c + f_p;
      f_tl := (f_c - (f_s - (f_s - f_c))) + (f_p - (f_s - f_c));
      f_w := (f_tl - ((f_tl + f_e) - ((f_tl + f_e) - f_tl))) + (f_e - ((f_tl + f_e) - f_tl));
      l_u := f_s + (f_tl + f_e);
      if f_w <> 0 and ((f_s - (l_u - (l_u - f_s))) + ((f_tl + f_e) - (l_u - f_s))) <> 0 and (l_u + 2 * ((f_s - (l_u - (l_u - f_s))) + ((f_tl + f_e) - (l_u - f_s)))) - l_u = 2 * ((f_s - (l_u - (l_u - f_s))) + ((f_tl + f_e) - (l_u - f_s))) and (f_w < 0) = (((f_s - (l_u - (l_u - f_s))) + ((f_tl + f_e) - (l_u - f_s))) < 0) then l_u := l_u + 2 * ((f_s - (l_u - (l_u - f_s))) + ((f_tl + f_e) - (l_u - f_s))); end if;
    elsif l_s = 0 or f_b = 0 then
      l_u := l_s * f_b + f_c;
    else
      l_u := fdlibm_fma_wide(a => l_s, b => f_b, c => f_c);
    end if;
    lg := l_dk * 6.93147180369123816490e-01 - (l_u - l_f); exit;
  end loop;

  if abs(y) >= 1e-144 and abs(y) <= 1e144 and abs((3.69423907715893078616e-13)::float8) >= 1e-144 and abs((3.69423907715893078616e-13)::float8) <= 1e144 and abs((4.34294481903251816668e-01 * lg)::float8) <= 1e288 then

    f_p := y * (3.69423907715893078616e-13)::float8;

    f_ah := (y * 134217729 - (y * 134217729 - y));

    f_e := (y - f_ah) * ((3.69423907715893078616e-13)::float8 - ((3.69423907715893078616e-13)::float8 * 134217729 - ((3.69423907715893078616e-13)::float8 * 134217729 - (3.69423907715893078616e-13)::float8))) - (((f_p - f_ah * ((3.69423907715893078616e-13)::float8 * 134217729 - ((3.69423907715893078616e-13)::float8 * 134217729 - (3.69423907715893078616e-13)::float8))) - (y - f_ah) * ((3.69423907715893078616e-13)::float8 * 134217729 - ((3.69423907715893078616e-13)::float8 * 134217729 - (3.69423907715893078616e-13)::float8))) - f_ah * ((3.69423907715893078616e-13)::float8 - ((3.69423907715893078616e-13)::float8 * 134217729 - ((3.69423907715893078616e-13)::float8 * 134217729 - (3.69423907715893078616e-13)::float8))));

    f_s := (4.34294481903251816668e-01 * lg)::float8 + f_p;

    f_tl := ((4.34294481903251816668e-01 * lg)::float8 - (f_s - (f_s - (4.34294481903251816668e-01 * lg)::float8))) + (f_p - (f_s - (4.34294481903251816668e-01 * lg)::float8));

    f_w := (f_tl - ((f_tl + f_e) - ((f_tl + f_e) - f_tl))) + (f_e - ((f_tl + f_e) - f_tl));

    u := f_s + (f_tl + f_e);

    if f_w <> 0 and ((f_s - (u - (u - f_s))) + ((f_tl + f_e) - (u - f_s))) <> 0 and (u + 2 * ((f_s - (u - (u - f_s))) + ((f_tl + f_e) - (u - f_s)))) - u = 2 * ((f_s - (u - (u - f_s))) + ((f_tl + f_e) - (u - f_s))) and (f_w < 0) = (((f_s - (u - (u - f_s))) + ((f_tl + f_e) - (u - f_s))) < 0) then u := u + 2 * ((f_s - (u - (u - f_s))) + ((f_tl + f_e) - (u - f_s))); end if;

  elsif y = 0 or (3.69423907715893078616e-13)::float8 = 0 then

    u := y * (3.69423907715893078616e-13)::float8 + (4.34294481903251816668e-01 * lg)::float8;

  else

    u := fdlibm_fma_wide(a => y, b => (3.69423907715893078616e-13)::float8, c => (4.34294481903251816668e-01 * lg)::float8);

  end if;
  return u + y * 3.01029995663611771306e-01;
end $$;

-- V8's sinh (ieee754.cc; Math.sinh). 2 × t is exact.
create function p3.fdlibm_sinh(x float8) returns float8 language plpgsql immutable as $$
declare f_a float8; f_b float8; f_c float8; f_p float8; f_ah float8; f_bh float8; f_e float8; f_s float8; f_tl float8; f_w float8; m_x float8; m_hx int; m_xsb boolean; m_k int; m_hi float8; m_lo float8; m_c float8; m_t float8; m_e float8; m_hxs float8; m_hfx float8; m_r1 float8; m_y float8; m_u float8;
 e_x float8; e_hx int; e_xsb int; e_hi float8; e_lo float8; e_k int; e_t float8; e_c float8; e_y float8; e_u float8;
 h float8 := case when x < 0 then -0.5 else 0.5 end; ax float8 := abs(x); t float8; w float8;
begin
  if x = 'NaN' then return x; end if;
  if ax < 22 then
    if ax < 3.725290298461914e-9 then return x; end if;
  loop
    m_x := ax;
    m_hx := (int8(float8send(m_x)) >> 32)::int;
    m_xsb := m_hx < 0;
    m_hx := m_hx & 2147483647;
    if m_hx >= 0x4043687A then
      if m_hx >= 0x40862E42 then
        if m_hx >= 0x7FF00000 then
          if (m_hx & 0xFFFFF) <> 0 or (int8(float8send(m_x)) & 4294967295) <> 0 then t := m_x; exit; end if;
          t := case when m_xsb then -1 else m_x end; exit;
        end if;
        if m_x > 7.09782712893383973096e+02 then t := 'Infinity'; exit; end if;
      end if;
      if m_xsb then t := -1; exit; end if;
    end if;
    if m_hx > 0x3FD62E42 then
      if m_hx < 0x3FF0A2B2 then
        if not m_xsb then
          m_hi := m_x - 6.93147180369123816490e-01; m_lo := 1.90821492927058770002e-10; m_k := 1;
        else
          m_hi := m_x + 6.93147180369123816490e-01; m_lo := -1.90821492927058770002e-10; m_k := -1;
        end if;
      else
        f_c := case when m_xsb then -0.5 else 0.5 end;
        if abs((1.44269504088896338700e+00)::float8) >= 1e-144 and abs((1.44269504088896338700e+00)::float8) <= 1e144 and abs(m_x) >= 1e-144 and abs(m_x) <= 1e144 and abs(f_c) <= 1e288 then
          f_p := (1.44269504088896338700e+00)::float8 * m_x;
          f_bh := (m_x * 134217729 - (m_x * 134217729 - m_x));
          f_e := ((1.44269504088896338700e+00)::float8 - ((1.44269504088896338700e+00)::float8 * 134217729 - ((1.44269504088896338700e+00)::float8 * 134217729 - (1.44269504088896338700e+00)::float8))) * (m_x - f_bh) - (((f_p - ((1.44269504088896338700e+00)::float8 * 134217729 - ((1.44269504088896338700e+00)::float8 * 134217729 - (1.44269504088896338700e+00)::float8)) * f_bh) - ((1.44269504088896338700e+00)::float8 - ((1.44269504088896338700e+00)::float8 * 134217729 - ((1.44269504088896338700e+00)::float8 * 134217729 - (1.44269504088896338700e+00)::float8))) * f_bh) - ((1.44269504088896338700e+00)::float8 * 134217729 - ((1.44269504088896338700e+00)::float8 * 134217729 - (1.44269504088896338700e+00)::float8)) * (m_x - f_bh));
          f_s := f_c + f_p;
          f_tl := (f_c - (f_s - (f_s - f_c))) + (f_p - (f_s - f_c));
          f_w := (f_tl - ((f_tl + f_e) - ((f_tl + f_e) - f_tl))) + (f_e - ((f_tl + f_e) - f_tl));
          m_u := f_s + (f_tl + f_e);
          if f_w <> 0 and ((f_s - (m_u - (m_u - f_s))) + ((f_tl + f_e) - (m_u - f_s))) <> 0 and (m_u + 2 * ((f_s - (m_u - (m_u - f_s))) + ((f_tl + f_e) - (m_u - f_s)))) - m_u = 2 * ((f_s - (m_u - (m_u - f_s))) + ((f_tl + f_e) - (m_u - f_s))) and (f_w < 0) = (((f_s - (m_u - (m_u - f_s))) + ((f_tl + f_e) - (m_u - f_s))) < 0) then m_u := m_u + 2 * ((f_s - (m_u - (m_u - f_s))) + ((f_tl + f_e) - (m_u - f_s))); end if;
        elsif (1.44269504088896338700e+00)::float8 = 0 or m_x = 0 then
          m_u := (1.44269504088896338700e+00)::float8 * m_x + f_c;
        else
          m_u := fdlibm_fma_wide(a => (1.44269504088896338700e+00)::float8, b => m_x, c => f_c);
        end if;
        m_k := trunc(m_u)::int;
        m_t := m_k;
        m_hi := m_x - m_t * 6.93147180369123816490e-01;
        m_lo := m_t * 1.90821492927058770002e-10;
      end if;
      m_x := m_hi - m_lo;
      m_c := (m_hi - m_x) - m_lo;
    elsif m_hx < 0x3C900000 then
      t := m_x; exit;
    else
      m_k := 0;
    end if;
    m_hfx := 0.5 * m_x;
    m_hxs := m_x * m_hfx;
    if abs(m_hxs) >= 1e-144 and abs(m_hxs) <= 1e144 and abs((-2.01099218183624371326e-07)::float8) >= 1e-144 and abs((-2.01099218183624371326e-07)::float8) <= 1e144 and abs((4.00821782732936239552e-06)::float8) <= 1e288 then
      f_p := m_hxs * (-2.01099218183624371326e-07)::float8;
      f_ah := (m_hxs * 134217729 - (m_hxs * 134217729 - m_hxs));
      f_e := (m_hxs - f_ah) * ((-2.01099218183624371326e-07)::float8 - ((-2.01099218183624371326e-07)::float8 * 134217729 - ((-2.01099218183624371326e-07)::float8 * 134217729 - (-2.01099218183624371326e-07)::float8))) - (((f_p - f_ah * ((-2.01099218183624371326e-07)::float8 * 134217729 - ((-2.01099218183624371326e-07)::float8 * 134217729 - (-2.01099218183624371326e-07)::float8))) - (m_hxs - f_ah) * ((-2.01099218183624371326e-07)::float8 * 134217729 - ((-2.01099218183624371326e-07)::float8 * 134217729 - (-2.01099218183624371326e-07)::float8))) - f_ah * ((-2.01099218183624371326e-07)::float8 - ((-2.01099218183624371326e-07)::float8 * 134217729 - ((-2.01099218183624371326e-07)::float8 * 134217729 - (-2.01099218183624371326e-07)::float8))));
      f_s := (4.00821782732936239552e-06)::float8 + f_p;
      f_tl := ((4.00821782732936239552e-06)::float8 - (f_s - (f_s - (4.00821782732936239552e-06)::float8))) + (f_p - (f_s - (4.00821782732936239552e-06)::float8));
      f_w := (f_tl - ((f_tl + f_e) - ((f_tl + f_e) - f_tl))) + (f_e - ((f_tl + f_e) - f_tl));
      m_r1 := f_s + (f_tl + f_e);
      if f_w <> 0 and ((f_s - (m_r1 - (m_r1 - f_s))) + ((f_tl + f_e) - (m_r1 - f_s))) <> 0 and (m_r1 + 2 * ((f_s - (m_r1 - (m_r1 - f_s))) + ((f_tl + f_e) - (m_r1 - f_s)))) - m_r1 = 2 * ((f_s - (m_r1 - (m_r1 - f_s))) + ((f_tl + f_e) - (m_r1 - f_s))) and (f_w < 0) = (((f_s - (m_r1 - (m_r1 - f_s))) + ((f_tl + f_e) - (m_r1 - f_s))) < 0) then m_r1 := m_r1 + 2 * ((f_s - (m_r1 - (m_r1 - f_s))) + ((f_tl + f_e) - (m_r1 - f_s))); end if;
    elsif m_hxs = 0 or (-2.01099218183624371326e-07)::float8 = 0 then
      m_r1 := m_hxs * (-2.01099218183624371326e-07)::float8 + (4.00821782732936239552e-06)::float8;
    else
      m_r1 := fdlibm_fma_wide(a => m_hxs, b => (-2.01099218183624371326e-07)::float8, c => (4.00821782732936239552e-06)::float8);
    end if;
    if abs(m_hxs) >= 1e-144 and abs(m_hxs) <= 1e144 and abs(m_r1) >= 1e-144 and abs(m_r1) <= 1e144 and abs((-7.93650757867487942473e-05)::float8) <= 1e288 then
      f_p := m_hxs * m_r1;
      f_ah := (m_hxs * 134217729 - (m_hxs * 134217729 - m_hxs));
      f_bh := (m_r1 * 134217729 - (m_r1 * 134217729 - m_r1));
      f_e := (m_hxs - f_ah) * (m_r1 - f_bh) - (((f_p - f_ah * f_bh) - (m_hxs - f_ah) * f_bh) - f_ah * (m_r1 - f_bh));
      f_s := (-7.93650757867487942473e-05)::float8 + f_p;
      f_tl := ((-7.93650757867487942473e-05)::float8 - (f_s - (f_s - (-7.93650757867487942473e-05)::float8))) + (f_p - (f_s - (-7.93650757867487942473e-05)::float8));
      f_w := (f_tl - ((f_tl + f_e) - ((f_tl + f_e) - f_tl))) + (f_e - ((f_tl + f_e) - f_tl));
      m_r1 := f_s + (f_tl + f_e);
      if f_w <> 0 and ((f_s - (m_r1 - (m_r1 - f_s))) + ((f_tl + f_e) - (m_r1 - f_s))) <> 0 and (m_r1 + 2 * ((f_s - (m_r1 - (m_r1 - f_s))) + ((f_tl + f_e) - (m_r1 - f_s)))) - m_r1 = 2 * ((f_s - (m_r1 - (m_r1 - f_s))) + ((f_tl + f_e) - (m_r1 - f_s))) and (f_w < 0) = (((f_s - (m_r1 - (m_r1 - f_s))) + ((f_tl + f_e) - (m_r1 - f_s))) < 0) then m_r1 := m_r1 + 2 * ((f_s - (m_r1 - (m_r1 - f_s))) + ((f_tl + f_e) - (m_r1 - f_s))); end if;
    elsif m_hxs = 0 or m_r1 = 0 then
      m_r1 := m_hxs * m_r1 + (-7.93650757867487942473e-05)::float8;
    else
      m_r1 := fdlibm_fma_wide(a => m_hxs, b => m_r1, c => (-7.93650757867487942473e-05)::float8);
    end if;
    if abs(m_hxs) >= 1e-144 and abs(m_hxs) <= 1e144 and abs(m_r1) >= 1e-144 and abs(m_r1) <= 1e144 and abs((1.58730158725481460165e-03)::float8) <= 1e288 then
      f_p := m_hxs * m_r1;
      f_ah := (m_hxs * 134217729 - (m_hxs * 134217729 - m_hxs));
      f_bh := (m_r1 * 134217729 - (m_r1 * 134217729 - m_r1));
      f_e := (m_hxs - f_ah) * (m_r1 - f_bh) - (((f_p - f_ah * f_bh) - (m_hxs - f_ah) * f_bh) - f_ah * (m_r1 - f_bh));
      f_s := (1.58730158725481460165e-03)::float8 + f_p;
      f_tl := ((1.58730158725481460165e-03)::float8 - (f_s - (f_s - (1.58730158725481460165e-03)::float8))) + (f_p - (f_s - (1.58730158725481460165e-03)::float8));
      f_w := (f_tl - ((f_tl + f_e) - ((f_tl + f_e) - f_tl))) + (f_e - ((f_tl + f_e) - f_tl));
      m_r1 := f_s + (f_tl + f_e);
      if f_w <> 0 and ((f_s - (m_r1 - (m_r1 - f_s))) + ((f_tl + f_e) - (m_r1 - f_s))) <> 0 and (m_r1 + 2 * ((f_s - (m_r1 - (m_r1 - f_s))) + ((f_tl + f_e) - (m_r1 - f_s)))) - m_r1 = 2 * ((f_s - (m_r1 - (m_r1 - f_s))) + ((f_tl + f_e) - (m_r1 - f_s))) and (f_w < 0) = (((f_s - (m_r1 - (m_r1 - f_s))) + ((f_tl + f_e) - (m_r1 - f_s))) < 0) then m_r1 := m_r1 + 2 * ((f_s - (m_r1 - (m_r1 - f_s))) + ((f_tl + f_e) - (m_r1 - f_s))); end if;
    elsif m_hxs = 0 or m_r1 = 0 then
      m_r1 := m_hxs * m_r1 + (1.58730158725481460165e-03)::float8;
    else
      m_r1 := fdlibm_fma_wide(a => m_hxs, b => m_r1, c => (1.58730158725481460165e-03)::float8);
    end if;
    if abs(m_hxs) >= 1e-144 and abs(m_hxs) <= 1e144 and abs(m_r1) >= 1e-144 and abs(m_r1) <= 1e144 and abs((-3.33333333333331316428e-02)::float8) <= 1e288 then
      f_p := m_hxs * m_r1;
      f_ah := (m_hxs * 134217729 - (m_hxs * 134217729 - m_hxs));
      f_bh := (m_r1 * 134217729 - (m_r1 * 134217729 - m_r1));
      f_e := (m_hxs - f_ah) * (m_r1 - f_bh) - (((f_p - f_ah * f_bh) - (m_hxs - f_ah) * f_bh) - f_ah * (m_r1 - f_bh));
      f_s := (-3.33333333333331316428e-02)::float8 + f_p;
      f_tl := ((-3.33333333333331316428e-02)::float8 - (f_s - (f_s - (-3.33333333333331316428e-02)::float8))) + (f_p - (f_s - (-3.33333333333331316428e-02)::float8));
      f_w := (f_tl - ((f_tl + f_e) - ((f_tl + f_e) - f_tl))) + (f_e - ((f_tl + f_e) - f_tl));
      m_r1 := f_s + (f_tl + f_e);
      if f_w <> 0 and ((f_s - (m_r1 - (m_r1 - f_s))) + ((f_tl + f_e) - (m_r1 - f_s))) <> 0 and (m_r1 + 2 * ((f_s - (m_r1 - (m_r1 - f_s))) + ((f_tl + f_e) - (m_r1 - f_s)))) - m_r1 = 2 * ((f_s - (m_r1 - (m_r1 - f_s))) + ((f_tl + f_e) - (m_r1 - f_s))) and (f_w < 0) = (((f_s - (m_r1 - (m_r1 - f_s))) + ((f_tl + f_e) - (m_r1 - f_s))) < 0) then m_r1 := m_r1 + 2 * ((f_s - (m_r1 - (m_r1 - f_s))) + ((f_tl + f_e) - (m_r1 - f_s))); end if;
    elsif m_hxs = 0 or m_r1 = 0 then
      m_r1 := m_hxs * m_r1 + (-3.33333333333331316428e-02)::float8;
    else
      m_r1 := fdlibm_fma_wide(a => m_hxs, b => m_r1, c => (-3.33333333333331316428e-02)::float8);
    end if;
    if abs(m_hxs) >= 1e-144 and abs(m_hxs) <= 1e144 and abs(m_r1) >= 1e-144 and abs(m_r1) <= 1e144 and abs((1)::float8) <= 1e288 then
      f_p := m_hxs * m_r1;
      f_ah := (m_hxs * 134217729 - (m_hxs * 134217729 - m_hxs));
      f_bh := (m_r1 * 134217729 - (m_r1 * 134217729 - m_r1));
      f_e := (m_hxs - f_ah) * (m_r1 - f_bh) - (((f_p - f_ah * f_bh) - (m_hxs - f_ah) * f_bh) - f_ah * (m_r1 - f_bh));
      f_s := (1)::float8 + f_p;
      f_tl := ((1)::float8 - (f_s - (f_s - (1)::float8))) + (f_p - (f_s - (1)::float8));
      f_w := (f_tl - ((f_tl + f_e) - ((f_tl + f_e) - f_tl))) + (f_e - ((f_tl + f_e) - f_tl));
      m_r1 := f_s + (f_tl + f_e);
      if f_w <> 0 and ((f_s - (m_r1 - (m_r1 - f_s))) + ((f_tl + f_e) - (m_r1 - f_s))) <> 0 and (m_r1 + 2 * ((f_s - (m_r1 - (m_r1 - f_s))) + ((f_tl + f_e) - (m_r1 - f_s)))) - m_r1 = 2 * ((f_s - (m_r1 - (m_r1 - f_s))) + ((f_tl + f_e) - (m_r1 - f_s))) and (f_w < 0) = (((f_s - (m_r1 - (m_r1 - f_s))) + ((f_tl + f_e) - (m_r1 - f_s))) < 0) then m_r1 := m_r1 + 2 * ((f_s - (m_r1 - (m_r1 - f_s))) + ((f_tl + f_e) - (m_r1 - f_s))); end if;
    elsif m_hxs = 0 or m_r1 = 0 then
      m_r1 := m_hxs * m_r1 + (1)::float8;
    else
      m_r1 := fdlibm_fma_wide(a => m_hxs, b => m_r1, c => (1)::float8);
    end if;
    if abs(-m_r1) >= 1e-144 and abs(-m_r1) <= 1e144 and abs(m_hfx) >= 1e-144 and abs(m_hfx) <= 1e144 and abs((3)::float8) <= 1e288 then
      f_p := -m_r1 * m_hfx;
      f_ah := (-m_r1 * 134217729 - (-m_r1 * 134217729 - -m_r1));
      f_bh := (m_hfx * 134217729 - (m_hfx * 134217729 - m_hfx));
      f_e := (-m_r1 - f_ah) * (m_hfx - f_bh) - (((f_p - f_ah * f_bh) - (-m_r1 - f_ah) * f_bh) - f_ah * (m_hfx - f_bh));
      f_s := (3)::float8 + f_p;
      f_tl := ((3)::float8 - (f_s - (f_s - (3)::float8))) + (f_p - (f_s - (3)::float8));
      f_w := (f_tl - ((f_tl + f_e) - ((f_tl + f_e) - f_tl))) + (f_e - ((f_tl + f_e) - f_tl));
      m_t := f_s + (f_tl + f_e);
      if f_w <> 0 and ((f_s - (m_t - (m_t - f_s))) + ((f_tl + f_e) - (m_t - f_s))) <> 0 and (m_t + 2 * ((f_s - (m_t - (m_t - f_s))) + ((f_tl + f_e) - (m_t - f_s)))) - m_t = 2 * ((f_s - (m_t - (m_t - f_s))) + ((f_tl + f_e) - (m_t - f_s))) and (f_w < 0) = (((f_s - (m_t - (m_t - f_s))) + ((f_tl + f_e) - (m_t - f_s))) < 0) then m_t := m_t + 2 * ((f_s - (m_t - (m_t - f_s))) + ((f_tl + f_e) - (m_t - f_s))); end if;
    elsif -m_r1 = 0 or m_hfx = 0 then
      m_t := -m_r1 * m_hfx + (3)::float8;
    else
      m_t := fdlibm_fma_wide(a => -m_r1, b => m_hfx, c => (3)::float8);
    end if;
    if abs(-m_x) >= 1e-144 and abs(-m_x) <= 1e144 and abs(m_t) >= 1e-144 and abs(m_t) <= 1e144 and abs((6)::float8) <= 1e288 then
      f_p := -m_x * m_t;
      f_ah := (-m_x * 134217729 - (-m_x * 134217729 - -m_x));
      f_bh := (m_t * 134217729 - (m_t * 134217729 - m_t));
      f_e := (-m_x - f_ah) * (m_t - f_bh) - (((f_p - f_ah * f_bh) - (-m_x - f_ah) * f_bh) - f_ah * (m_t - f_bh));
      f_s := (6)::float8 + f_p;
      f_tl := ((6)::float8 - (f_s - (f_s - (6)::float8))) + (f_p - (f_s - (6)::float8));
      f_w := (f_tl - ((f_tl + f_e) - ((f_tl + f_e) - f_tl))) + (f_e - ((f_tl + f_e) - f_tl));
      m_u := f_s + (f_tl + f_e);
      if f_w <> 0 and ((f_s - (m_u - (m_u - f_s))) + ((f_tl + f_e) - (m_u - f_s))) <> 0 and (m_u + 2 * ((f_s - (m_u - (m_u - f_s))) + ((f_tl + f_e) - (m_u - f_s)))) - m_u = 2 * ((f_s - (m_u - (m_u - f_s))) + ((f_tl + f_e) - (m_u - f_s))) and (f_w < 0) = (((f_s - (m_u - (m_u - f_s))) + ((f_tl + f_e) - (m_u - f_s))) < 0) then m_u := m_u + 2 * ((f_s - (m_u - (m_u - f_s))) + ((f_tl + f_e) - (m_u - f_s))); end if;
    elsif -m_x = 0 or m_t = 0 then
      m_u := -m_x * m_t + (6)::float8;
    else
      m_u := fdlibm_fma_wide(a => -m_x, b => m_t, c => (6)::float8);
    end if;
    m_e := m_hxs * ((m_r1 - m_t) / m_u);
    if m_k = 0 then
      if abs(m_x) >= 1e-144 and abs(m_x) <= 1e144 and abs(m_e) >= 1e-144 and abs(m_e) <= 1e144 and abs(-m_hxs) <= 1e288 then
        f_p := m_x * m_e;
        f_ah := (m_x * 134217729 - (m_x * 134217729 - m_x));
        f_bh := (m_e * 134217729 - (m_e * 134217729 - m_e));
        f_e := (m_x - f_ah) * (m_e - f_bh) - (((f_p - f_ah * f_bh) - (m_x - f_ah) * f_bh) - f_ah * (m_e - f_bh));
        f_s := -m_hxs + f_p;
        f_tl := (-m_hxs - (f_s - (f_s - -m_hxs))) + (f_p - (f_s - -m_hxs));
        f_w := (f_tl - ((f_tl + f_e) - ((f_tl + f_e) - f_tl))) + (f_e - ((f_tl + f_e) - f_tl));
        m_u := f_s + (f_tl + f_e);
        if f_w <> 0 and ((f_s - (m_u - (m_u - f_s))) + ((f_tl + f_e) - (m_u - f_s))) <> 0 and (m_u + 2 * ((f_s - (m_u - (m_u - f_s))) + ((f_tl + f_e) - (m_u - f_s)))) - m_u = 2 * ((f_s - (m_u - (m_u - f_s))) + ((f_tl + f_e) - (m_u - f_s))) and (f_w < 0) = (((f_s - (m_u - (m_u - f_s))) + ((f_tl + f_e) - (m_u - f_s))) < 0) then m_u := m_u + 2 * ((f_s - (m_u - (m_u - f_s))) + ((f_tl + f_e) - (m_u - f_s))); end if;
      elsif m_x = 0 or m_e = 0 then
        m_u := m_x * m_e + -m_hxs;
      else
        m_u := fdlibm_fma_wide(a => m_x, b => m_e, c => -m_hxs);
      end if;
      t := m_x - m_u; exit;
    end if;
    f_b := m_e - m_c;
    if abs(m_x) >= 1e-144 and abs(m_x) <= 1e144 and abs(f_b) >= 1e-144 and abs(f_b) <= 1e144 and abs(-m_c) <= 1e288 then
      f_p := m_x * f_b;
      f_ah := (m_x * 134217729 - (m_x * 134217729 - m_x));
      f_bh := (f_b * 134217729 - (f_b * 134217729 - f_b));
      f_e := (m_x - f_ah) * (f_b - f_bh) - (((f_p - f_ah * f_bh) - (m_x - f_ah) * f_bh) - f_ah * (f_b - f_bh));
      f_s := -m_c + f_p;
      f_tl := (-m_c - (f_s - (f_s - -m_c))) + (f_p - (f_s - -m_c));
      f_w := (f_tl - ((f_tl + f_e) - ((f_tl + f_e) - f_tl))) + (f_e - ((f_tl + f_e) - f_tl));
      m_e := f_s + (f_tl + f_e);
      if f_w <> 0 and ((f_s - (m_e - (m_e - f_s))) + ((f_tl + f_e) - (m_e - f_s))) <> 0 and (m_e + 2 * ((f_s - (m_e - (m_e - f_s))) + ((f_tl + f_e) - (m_e - f_s)))) - m_e = 2 * ((f_s - (m_e - (m_e - f_s))) + ((f_tl + f_e) - (m_e - f_s))) and (f_w < 0) = (((f_s - (m_e - (m_e - f_s))) + ((f_tl + f_e) - (m_e - f_s))) < 0) then m_e := m_e + 2 * ((f_s - (m_e - (m_e - f_s))) + ((f_tl + f_e) - (m_e - f_s))); end if;
    elsif m_x = 0 or f_b = 0 then
      m_e := m_x * f_b + -m_c;
    else
      m_e := fdlibm_fma_wide(a => m_x, b => f_b, c => -m_c);
    end if;
    m_e := m_e - m_hxs;
    if m_k = -1 then t := 0.5 * (m_x - m_e) - 0.5; exit; end if;
    if m_k = 1 then
      if m_x < -0.25 then t := -2 * (m_e - (m_x + 0.5)); exit; end if;
      t := 1 + 2 * (m_x - m_e); exit;
    end if;
    if m_k <= -2 or m_k > 56 then
      m_y := 1 - (m_e - m_x);
      if m_k = 1024 then
        if m_y >= 1 then t := 'Infinity'; exit; end if;
        m_y := m_y * 2 * 8.98846567431158e+307;
      else
        m_y := m_y * (('{2.2250738585072014e-308,4.1045368012983762e-289,7.571533991467358e-270,1.3967014978599092e-250,2.5764595078388533e-231,4.7527289157379e-212,8.767237396033612e-193,1.617269844780878e-173,2.983336292480083e-154,5.503284107318959e-135,1.0151767349262597e-115,1.8726705418768793e-96,3.454467422037778e-77,6.372367644529809e-58,1.1754943508222875e-38,2.168404344971009e-19,4,73786976294838210000,1.361129467683754e+39,2.5108406941546723e+58,4.631683569492648e+77,8.54394814368364e+96,1.5760802478557792e+116,2.9073548971824276e+135,5.363123171977039e+154,9.893216058924181e+173,1.824976247048878e+193,3.366486976990959e+212,6.210072369202836e+231,1.1455561567389984e+251,2.113178124542661e+270,3.89812560456e+289}'::float8[])[(((m_k) + 1022) >> 6) + 1] * ('{1,2,4,8,16,32,64,128,256,512,1024,2048,4096,8192,16384,32768,65536,131072,262144,524288,1048576,2097152,4194304,8388608,16777216,33554432,67108864,134217728,268435456,536870912,1073741824,2147483648,4294967296,8589934592,17179869184,34359738368,68719476736,137438953472,274877906944,549755813888,1099511627776,2199023255552,4398046511104,8796093022208,17592186044416,35184372088832,70368744177664,140737488355328,281474976710656,562949953421312,1125899906842624,2251799813685248,4503599627370496,9007199254740992,18014398509481984,36028797018963970,72057594037927940,144115188075855870,288230376151711740,576460752303423500,1152921504606847000,2305843009213694000,4611686018427388000,9223372036854776000}'::float8[])[(((m_k) + 1022) & 63) + 1]);
      end if;
      t := m_y - 1; exit;
    end if;
    if m_k < 20 then
      m_y := (1 - (('{2.2250738585072014e-308,4.1045368012983762e-289,7.571533991467358e-270,1.3967014978599092e-250,2.5764595078388533e-231,4.7527289157379e-212,8.767237396033612e-193,1.617269844780878e-173,2.983336292480083e-154,5.503284107318959e-135,1.0151767349262597e-115,1.8726705418768793e-96,3.454467422037778e-77,6.372367644529809e-58,1.1754943508222875e-38,2.168404344971009e-19,4,73786976294838210000,1.361129467683754e+39,2.5108406941546723e+58,4.631683569492648e+77,8.54394814368364e+96,1.5760802478557792e+116,2.9073548971824276e+135,5.363123171977039e+154,9.893216058924181e+173,1.824976247048878e+193,3.366486976990959e+212,6.210072369202836e+231,1.1455561567389984e+251,2.113178124542661e+270,3.89812560456e+289}'::float8[])[(((-m_k) + 1022) >> 6) + 1] * ('{1,2,4,8,16,32,64,128,256,512,1024,2048,4096,8192,16384,32768,65536,131072,262144,524288,1048576,2097152,4194304,8388608,16777216,33554432,67108864,134217728,268435456,536870912,1073741824,2147483648,4294967296,8589934592,17179869184,34359738368,68719476736,137438953472,274877906944,549755813888,1099511627776,2199023255552,4398046511104,8796093022208,17592186044416,35184372088832,70368744177664,140737488355328,281474976710656,562949953421312,1125899906842624,2251799813685248,4503599627370496,9007199254740992,18014398509481984,36028797018963970,72057594037927940,144115188075855870,288230376151711740,576460752303423500,1152921504606847000,2305843009213694000,4611686018427388000,9223372036854776000}'::float8[])[(((-m_k) + 1022) & 63) + 1])) - (m_e - m_x);
    else
      m_y := (m_x - (m_e + (('{2.2250738585072014e-308,4.1045368012983762e-289,7.571533991467358e-270,1.3967014978599092e-250,2.5764595078388533e-231,4.7527289157379e-212,8.767237396033612e-193,1.617269844780878e-173,2.983336292480083e-154,5.503284107318959e-135,1.0151767349262597e-115,1.8726705418768793e-96,3.454467422037778e-77,6.372367644529809e-58,1.1754943508222875e-38,2.168404344971009e-19,4,73786976294838210000,1.361129467683754e+39,2.5108406941546723e+58,4.631683569492648e+77,8.54394814368364e+96,1.5760802478557792e+116,2.9073548971824276e+135,5.363123171977039e+154,9.893216058924181e+173,1.824976247048878e+193,3.366486976990959e+212,6.210072369202836e+231,1.1455561567389984e+251,2.113178124542661e+270,3.89812560456e+289}'::float8[])[(((-m_k) + 1022) >> 6) + 1] * ('{1,2,4,8,16,32,64,128,256,512,1024,2048,4096,8192,16384,32768,65536,131072,262144,524288,1048576,2097152,4194304,8388608,16777216,33554432,67108864,134217728,268435456,536870912,1073741824,2147483648,4294967296,8589934592,17179869184,34359738368,68719476736,137438953472,274877906944,549755813888,1099511627776,2199023255552,4398046511104,8796093022208,17592186044416,35184372088832,70368744177664,140737488355328,281474976710656,562949953421312,1125899906842624,2251799813685248,4503599627370496,9007199254740992,18014398509481984,36028797018963970,72057594037927940,144115188075855870,288230376151711740,576460752303423500,1152921504606847000,2305843009213694000,4611686018427388000,9223372036854776000}'::float8[])[(((-m_k) + 1022) & 63) + 1]))) + 1;
    end if;
    t := m_y * (('{2.2250738585072014e-308,4.1045368012983762e-289,7.571533991467358e-270,1.3967014978599092e-250,2.5764595078388533e-231,4.7527289157379e-212,8.767237396033612e-193,1.617269844780878e-173,2.983336292480083e-154,5.503284107318959e-135,1.0151767349262597e-115,1.8726705418768793e-96,3.454467422037778e-77,6.372367644529809e-58,1.1754943508222875e-38,2.168404344971009e-19,4,73786976294838210000,1.361129467683754e+39,2.5108406941546723e+58,4.631683569492648e+77,8.54394814368364e+96,1.5760802478557792e+116,2.9073548971824276e+135,5.363123171977039e+154,9.893216058924181e+173,1.824976247048878e+193,3.366486976990959e+212,6.210072369202836e+231,1.1455561567389984e+251,2.113178124542661e+270,3.89812560456e+289}'::float8[])[(((m_k) + 1022) >> 6) + 1] * ('{1,2,4,8,16,32,64,128,256,512,1024,2048,4096,8192,16384,32768,65536,131072,262144,524288,1048576,2097152,4194304,8388608,16777216,33554432,67108864,134217728,268435456,536870912,1073741824,2147483648,4294967296,8589934592,17179869184,34359738368,68719476736,137438953472,274877906944,549755813888,1099511627776,2199023255552,4398046511104,8796093022208,17592186044416,35184372088832,70368744177664,140737488355328,281474976710656,562949953421312,1125899906842624,2251799813685248,4503599627370496,9007199254740992,18014398509481984,36028797018963970,72057594037927940,144115188075855870,288230376151711740,576460752303423500,1152921504606847000,2305843009213694000,4611686018427388000,9223372036854776000}'::float8[])[(((m_k) + 1022) & 63) + 1]); exit;
  end loop;

    if ax < 1 then return h * (2 * t - t * t / (t + 1)); end if;
    return h * (t + t / (t + 1));
  end if;
  if ax < 709.7822265625 then
  loop
    e_x := ax;
    e_hx := (int8(float8send(e_x)) >> 32)::int;
    e_xsb := (e_hx >> 31) & 1;
    e_hi := 0;
    e_lo := 0;
    e_k := 0;
    e_hx := e_hx & 2147483647;
    if e_hx >= 0x40862E42 then
      if e_hx >= 0x7FF00000 then
        if (e_hx & 0xFFFFF) <> 0 or (int8(float8send(e_x)) & 4294967295) <> 0 then t := e_x; exit; end if;
        t := case when e_xsb = 0 then e_x else 0 end; exit;
      end if;
      if e_x > 7.09782712893383973096e+02 then t := 'Infinity'; exit; end if;
      if e_x < -7.45133219101941108420e+02 then t := 0; exit; end if;
    end if;
    if e_hx > 0x3FD62E42 then
      if e_hx < 0x3FF0A2B2 then
        if e_x = 1 then t := 2.718281828459045; exit; end if;
        e_hi := e_x - case when e_xsb = 0 then 6.93147180369123816490e-01 else -6.93147180369123816490e-01 end;
        e_lo := case when e_xsb = 0 then 1.90821492927058770002e-10 else -1.90821492927058770002e-10 end;
        e_k := 1 - e_xsb - e_xsb;
      else
        f_c := case when e_xsb = 0 then 0.5 else -0.5 end;
        if abs((1.44269504088896338700e+00)::float8) >= 1e-144 and abs((1.44269504088896338700e+00)::float8) <= 1e144 and abs(e_x) >= 1e-144 and abs(e_x) <= 1e144 and abs(f_c) <= 1e288 then
          f_p := (1.44269504088896338700e+00)::float8 * e_x;
          f_bh := (e_x * 134217729 - (e_x * 134217729 - e_x));
          f_e := ((1.44269504088896338700e+00)::float8 - ((1.44269504088896338700e+00)::float8 * 134217729 - ((1.44269504088896338700e+00)::float8 * 134217729 - (1.44269504088896338700e+00)::float8))) * (e_x - f_bh) - (((f_p - ((1.44269504088896338700e+00)::float8 * 134217729 - ((1.44269504088896338700e+00)::float8 * 134217729 - (1.44269504088896338700e+00)::float8)) * f_bh) - ((1.44269504088896338700e+00)::float8 - ((1.44269504088896338700e+00)::float8 * 134217729 - ((1.44269504088896338700e+00)::float8 * 134217729 - (1.44269504088896338700e+00)::float8))) * f_bh) - ((1.44269504088896338700e+00)::float8 * 134217729 - ((1.44269504088896338700e+00)::float8 * 134217729 - (1.44269504088896338700e+00)::float8)) * (e_x - f_bh));
          f_s := f_c + f_p;
          f_tl := (f_c - (f_s - (f_s - f_c))) + (f_p - (f_s - f_c));
          f_w := (f_tl - ((f_tl + f_e) - ((f_tl + f_e) - f_tl))) + (f_e - ((f_tl + f_e) - f_tl));
          e_u := f_s + (f_tl + f_e);
          if f_w <> 0 and ((f_s - (e_u - (e_u - f_s))) + ((f_tl + f_e) - (e_u - f_s))) <> 0 and (e_u + 2 * ((f_s - (e_u - (e_u - f_s))) + ((f_tl + f_e) - (e_u - f_s)))) - e_u = 2 * ((f_s - (e_u - (e_u - f_s))) + ((f_tl + f_e) - (e_u - f_s))) and (f_w < 0) = (((f_s - (e_u - (e_u - f_s))) + ((f_tl + f_e) - (e_u - f_s))) < 0) then e_u := e_u + 2 * ((f_s - (e_u - (e_u - f_s))) + ((f_tl + f_e) - (e_u - f_s))); end if;
        elsif (1.44269504088896338700e+00)::float8 = 0 or e_x = 0 then
          e_u := (1.44269504088896338700e+00)::float8 * e_x + f_c;
        else
          e_u := fdlibm_fma_wide(a => (1.44269504088896338700e+00)::float8, b => e_x, c => f_c);
        end if;
        e_k := trunc(e_u)::int;
        e_t := e_k;
        e_hi := e_x - e_t * 6.93147180369123816490e-01;
        e_lo := e_t * 1.90821492927058770002e-10;
      end if;
      e_x := e_hi - e_lo;
    elsif e_hx < 0x3E300000 then
      t := 1 + e_x; exit;
    end if;
    e_t := e_x * e_x;
    if abs(e_t) >= 1e-144 and abs(e_t) <= 1e144 and abs((4.13813679705723846039e-08)::float8) >= 1e-144 and abs((4.13813679705723846039e-08)::float8) <= 1e144 and abs((-1.65339022054652515390e-06)::float8) <= 1e288 then
      f_p := e_t * (4.13813679705723846039e-08)::float8;
      f_ah := (e_t * 134217729 - (e_t * 134217729 - e_t));
      f_e := (e_t - f_ah) * ((4.13813679705723846039e-08)::float8 - ((4.13813679705723846039e-08)::float8 * 134217729 - ((4.13813679705723846039e-08)::float8 * 134217729 - (4.13813679705723846039e-08)::float8))) - (((f_p - f_ah * ((4.13813679705723846039e-08)::float8 * 134217729 - ((4.13813679705723846039e-08)::float8 * 134217729 - (4.13813679705723846039e-08)::float8))) - (e_t - f_ah) * ((4.13813679705723846039e-08)::float8 * 134217729 - ((4.13813679705723846039e-08)::float8 * 134217729 - (4.13813679705723846039e-08)::float8))) - f_ah * ((4.13813679705723846039e-08)::float8 - ((4.13813679705723846039e-08)::float8 * 134217729 - ((4.13813679705723846039e-08)::float8 * 134217729 - (4.13813679705723846039e-08)::float8))));
      f_s := (-1.65339022054652515390e-06)::float8 + f_p;
      f_tl := ((-1.65339022054652515390e-06)::float8 - (f_s - (f_s - (-1.65339022054652515390e-06)::float8))) + (f_p - (f_s - (-1.65339022054652515390e-06)::float8));
      f_w := (f_tl - ((f_tl + f_e) - ((f_tl + f_e) - f_tl))) + (f_e - ((f_tl + f_e) - f_tl));
      e_c := f_s + (f_tl + f_e);
      if f_w <> 0 and ((f_s - (e_c - (e_c - f_s))) + ((f_tl + f_e) - (e_c - f_s))) <> 0 and (e_c + 2 * ((f_s - (e_c - (e_c - f_s))) + ((f_tl + f_e) - (e_c - f_s)))) - e_c = 2 * ((f_s - (e_c - (e_c - f_s))) + ((f_tl + f_e) - (e_c - f_s))) and (f_w < 0) = (((f_s - (e_c - (e_c - f_s))) + ((f_tl + f_e) - (e_c - f_s))) < 0) then e_c := e_c + 2 * ((f_s - (e_c - (e_c - f_s))) + ((f_tl + f_e) - (e_c - f_s))); end if;
    elsif e_t = 0 or (4.13813679705723846039e-08)::float8 = 0 then
      e_c := e_t * (4.13813679705723846039e-08)::float8 + (-1.65339022054652515390e-06)::float8;
    else
      e_c := fdlibm_fma_wide(a => e_t, b => (4.13813679705723846039e-08)::float8, c => (-1.65339022054652515390e-06)::float8);
    end if;
    if abs(e_t) >= 1e-144 and abs(e_t) <= 1e144 and abs(e_c) >= 1e-144 and abs(e_c) <= 1e144 and abs((6.61375632143793436117e-05)::float8) <= 1e288 then
      f_p := e_t * e_c;
      f_ah := (e_t * 134217729 - (e_t * 134217729 - e_t));
      f_bh := (e_c * 134217729 - (e_c * 134217729 - e_c));
      f_e := (e_t - f_ah) * (e_c - f_bh) - (((f_p - f_ah * f_bh) - (e_t - f_ah) * f_bh) - f_ah * (e_c - f_bh));
      f_s := (6.61375632143793436117e-05)::float8 + f_p;
      f_tl := ((6.61375632143793436117e-05)::float8 - (f_s - (f_s - (6.61375632143793436117e-05)::float8))) + (f_p - (f_s - (6.61375632143793436117e-05)::float8));
      f_w := (f_tl - ((f_tl + f_e) - ((f_tl + f_e) - f_tl))) + (f_e - ((f_tl + f_e) - f_tl));
      e_c := f_s + (f_tl + f_e);
      if f_w <> 0 and ((f_s - (e_c - (e_c - f_s))) + ((f_tl + f_e) - (e_c - f_s))) <> 0 and (e_c + 2 * ((f_s - (e_c - (e_c - f_s))) + ((f_tl + f_e) - (e_c - f_s)))) - e_c = 2 * ((f_s - (e_c - (e_c - f_s))) + ((f_tl + f_e) - (e_c - f_s))) and (f_w < 0) = (((f_s - (e_c - (e_c - f_s))) + ((f_tl + f_e) - (e_c - f_s))) < 0) then e_c := e_c + 2 * ((f_s - (e_c - (e_c - f_s))) + ((f_tl + f_e) - (e_c - f_s))); end if;
    elsif e_t = 0 or e_c = 0 then
      e_c := e_t * e_c + (6.61375632143793436117e-05)::float8;
    else
      e_c := fdlibm_fma_wide(a => e_t, b => e_c, c => (6.61375632143793436117e-05)::float8);
    end if;
    if abs(e_t) >= 1e-144 and abs(e_t) <= 1e144 and abs(e_c) >= 1e-144 and abs(e_c) <= 1e144 and abs((-2.77777777770155933842e-03)::float8) <= 1e288 then
      f_p := e_t * e_c;
      f_ah := (e_t * 134217729 - (e_t * 134217729 - e_t));
      f_bh := (e_c * 134217729 - (e_c * 134217729 - e_c));
      f_e := (e_t - f_ah) * (e_c - f_bh) - (((f_p - f_ah * f_bh) - (e_t - f_ah) * f_bh) - f_ah * (e_c - f_bh));
      f_s := (-2.77777777770155933842e-03)::float8 + f_p;
      f_tl := ((-2.77777777770155933842e-03)::float8 - (f_s - (f_s - (-2.77777777770155933842e-03)::float8))) + (f_p - (f_s - (-2.77777777770155933842e-03)::float8));
      f_w := (f_tl - ((f_tl + f_e) - ((f_tl + f_e) - f_tl))) + (f_e - ((f_tl + f_e) - f_tl));
      e_c := f_s + (f_tl + f_e);
      if f_w <> 0 and ((f_s - (e_c - (e_c - f_s))) + ((f_tl + f_e) - (e_c - f_s))) <> 0 and (e_c + 2 * ((f_s - (e_c - (e_c - f_s))) + ((f_tl + f_e) - (e_c - f_s)))) - e_c = 2 * ((f_s - (e_c - (e_c - f_s))) + ((f_tl + f_e) - (e_c - f_s))) and (f_w < 0) = (((f_s - (e_c - (e_c - f_s))) + ((f_tl + f_e) - (e_c - f_s))) < 0) then e_c := e_c + 2 * ((f_s - (e_c - (e_c - f_s))) + ((f_tl + f_e) - (e_c - f_s))); end if;
    elsif e_t = 0 or e_c = 0 then
      e_c := e_t * e_c + (-2.77777777770155933842e-03)::float8;
    else
      e_c := fdlibm_fma_wide(a => e_t, b => e_c, c => (-2.77777777770155933842e-03)::float8);
    end if;
    if abs(e_t) >= 1e-144 and abs(e_t) <= 1e144 and abs(e_c) >= 1e-144 and abs(e_c) <= 1e144 and abs((1.66666666666666019037e-01)::float8) <= 1e288 then
      f_p := e_t * e_c;
      f_ah := (e_t * 134217729 - (e_t * 134217729 - e_t));
      f_bh := (e_c * 134217729 - (e_c * 134217729 - e_c));
      f_e := (e_t - f_ah) * (e_c - f_bh) - (((f_p - f_ah * f_bh) - (e_t - f_ah) * f_bh) - f_ah * (e_c - f_bh));
      f_s := (1.66666666666666019037e-01)::float8 + f_p;
      f_tl := ((1.66666666666666019037e-01)::float8 - (f_s - (f_s - (1.66666666666666019037e-01)::float8))) + (f_p - (f_s - (1.66666666666666019037e-01)::float8));
      f_w := (f_tl - ((f_tl + f_e) - ((f_tl + f_e) - f_tl))) + (f_e - ((f_tl + f_e) - f_tl));
      e_c := f_s + (f_tl + f_e);
      if f_w <> 0 and ((f_s - (e_c - (e_c - f_s))) + ((f_tl + f_e) - (e_c - f_s))) <> 0 and (e_c + 2 * ((f_s - (e_c - (e_c - f_s))) + ((f_tl + f_e) - (e_c - f_s)))) - e_c = 2 * ((f_s - (e_c - (e_c - f_s))) + ((f_tl + f_e) - (e_c - f_s))) and (f_w < 0) = (((f_s - (e_c - (e_c - f_s))) + ((f_tl + f_e) - (e_c - f_s))) < 0) then e_c := e_c + 2 * ((f_s - (e_c - (e_c - f_s))) + ((f_tl + f_e) - (e_c - f_s))); end if;
    elsif e_t = 0 or e_c = 0 then
      e_c := e_t * e_c + (1.66666666666666019037e-01)::float8;
    else
      e_c := fdlibm_fma_wide(a => e_t, b => e_c, c => (1.66666666666666019037e-01)::float8);
    end if;
    if abs(-e_t) >= 1e-144 and abs(-e_t) <= 1e144 and abs(e_c) >= 1e-144 and abs(e_c) <= 1e144 and abs(e_x) <= 1e288 then
      f_p := -e_t * e_c;
      f_ah := (-e_t * 134217729 - (-e_t * 134217729 - -e_t));
      f_bh := (e_c * 134217729 - (e_c * 134217729 - e_c));
      f_e := (-e_t - f_ah) * (e_c - f_bh) - (((f_p - f_ah * f_bh) - (-e_t - f_ah) * f_bh) - f_ah * (e_c - f_bh));
      f_s := e_x + f_p;
      f_tl := (e_x - (f_s - (f_s - e_x))) + (f_p - (f_s - e_x));
      f_w := (f_tl - ((f_tl + f_e) - ((f_tl + f_e) - f_tl))) + (f_e - ((f_tl + f_e) - f_tl));
      e_c := f_s + (f_tl + f_e);
      if f_w <> 0 and ((f_s - (e_c - (e_c - f_s))) + ((f_tl + f_e) - (e_c - f_s))) <> 0 and (e_c + 2 * ((f_s - (e_c - (e_c - f_s))) + ((f_tl + f_e) - (e_c - f_s)))) - e_c = 2 * ((f_s - (e_c - (e_c - f_s))) + ((f_tl + f_e) - (e_c - f_s))) and (f_w < 0) = (((f_s - (e_c - (e_c - f_s))) + ((f_tl + f_e) - (e_c - f_s))) < 0) then e_c := e_c + 2 * ((f_s - (e_c - (e_c - f_s))) + ((f_tl + f_e) - (e_c - f_s))); end if;
    elsif -e_t = 0 or e_c = 0 then
      e_c := -e_t * e_c + e_x;
    else
      e_c := fdlibm_fma_wide(a => -e_t, b => e_c, c => e_x);
    end if;
    if e_k = 0 then t := 1 - ((e_x * e_c) / (e_c - 2) - e_x); exit; end if;
    e_y := 1 - ((e_lo - (e_x * e_c) / (2 - e_c)) - e_hi);
    if e_k >= -1021 then
      if e_k = 1024 then t := case when e_y >= 1 then 'Infinity'::float8 else e_y * 2 * 8.988465674311579539e307 end; exit; end if;
      t := e_y * (('{2.2250738585072014e-308,4.1045368012983762e-289,7.571533991467358e-270,1.3967014978599092e-250,2.5764595078388533e-231,4.7527289157379e-212,8.767237396033612e-193,1.617269844780878e-173,2.983336292480083e-154,5.503284107318959e-135,1.0151767349262597e-115,1.8726705418768793e-96,3.454467422037778e-77,6.372367644529809e-58,1.1754943508222875e-38,2.168404344971009e-19,4,73786976294838210000,1.361129467683754e+39,2.5108406941546723e+58,4.631683569492648e+77,8.54394814368364e+96,1.5760802478557792e+116,2.9073548971824276e+135,5.363123171977039e+154,9.893216058924181e+173,1.824976247048878e+193,3.366486976990959e+212,6.210072369202836e+231,1.1455561567389984e+251,2.113178124542661e+270,3.89812560456e+289}'::float8[])[(((e_k) + 1022) >> 6) + 1] * ('{1,2,4,8,16,32,64,128,256,512,1024,2048,4096,8192,16384,32768,65536,131072,262144,524288,1048576,2097152,4194304,8388608,16777216,33554432,67108864,134217728,268435456,536870912,1073741824,2147483648,4294967296,8589934592,17179869184,34359738368,68719476736,137438953472,274877906944,549755813888,1099511627776,2199023255552,4398046511104,8796093022208,17592186044416,35184372088832,70368744177664,140737488355328,281474976710656,562949953421312,1125899906842624,2251799813685248,4503599627370496,9007199254740992,18014398509481984,36028797018963970,72057594037927940,144115188075855870,288230376151711740,576460752303423500,1152921504606847000,2305843009213694000,4611686018427388000,9223372036854776000}'::float8[])[(((e_k) + 1022) & 63) + 1]); exit;
    end if;
    e_y := e_y * (('{2.2250738585072014e-308,4.1045368012983762e-289,7.571533991467358e-270,1.3967014978599092e-250,2.5764595078388533e-231,4.7527289157379e-212,8.767237396033612e-193,1.617269844780878e-173,2.983336292480083e-154,5.503284107318959e-135,1.0151767349262597e-115,1.8726705418768793e-96,3.454467422037778e-77,6.372367644529809e-58,1.1754943508222875e-38,2.168404344971009e-19,4,73786976294838210000,1.361129467683754e+39,2.5108406941546723e+58,4.631683569492648e+77,8.54394814368364e+96,1.5760802478557792e+116,2.9073548971824276e+135,5.363123171977039e+154,9.893216058924181e+173,1.824976247048878e+193,3.366486976990959e+212,6.210072369202836e+231,1.1455561567389984e+251,2.113178124542661e+270,3.89812560456e+289}'::float8[])[(((e_k + 1000) + 1022) >> 6) + 1] * ('{1,2,4,8,16,32,64,128,256,512,1024,2048,4096,8192,16384,32768,65536,131072,262144,524288,1048576,2097152,4194304,8388608,16777216,33554432,67108864,134217728,268435456,536870912,1073741824,2147483648,4294967296,8589934592,17179869184,34359738368,68719476736,137438953472,274877906944,549755813888,1099511627776,2199023255552,4398046511104,8796093022208,17592186044416,35184372088832,70368744177664,140737488355328,281474976710656,562949953421312,1125899906842624,2251799813685248,4503599627370496,9007199254740992,18014398509481984,36028797018963970,72057594037927940,144115188075855870,288230376151711740,576460752303423500,1152921504606847000,2305843009213694000,4611686018427388000,9223372036854776000}'::float8[])[(((e_k + 1000) + 1022) & 63) + 1]);
    t := case when e_y <= 2.6469779601696886e-23 then 0 else e_y * 9.33263618503218878990e-302 end; exit;
  end loop;

    return h * t;
  end if;
  if ax <= 710.4758600739439 then
  loop
    e_x := 0.5 * ax;
    e_hx := (int8(float8send(e_x)) >> 32)::int;
    e_xsb := (e_hx >> 31) & 1;
    e_hi := 0;
    e_lo := 0;
    e_k := 0;
    e_hx := e_hx & 2147483647;
    if e_hx >= 0x40862E42 then
      if e_hx >= 0x7FF00000 then
        if (e_hx & 0xFFFFF) <> 0 or (int8(float8send(e_x)) & 4294967295) <> 0 then w := e_x; exit; end if;
        w := case when e_xsb = 0 then e_x else 0 end; exit;
      end if;
      if e_x > 7.09782712893383973096e+02 then w := 'Infinity'; exit; end if;
      if e_x < -7.45133219101941108420e+02 then w := 0; exit; end if;
    end if;
    if e_hx > 0x3FD62E42 then
      if e_hx < 0x3FF0A2B2 then
        if e_x = 1 then w := 2.718281828459045; exit; end if;
        e_hi := e_x - case when e_xsb = 0 then 6.93147180369123816490e-01 else -6.93147180369123816490e-01 end;
        e_lo := case when e_xsb = 0 then 1.90821492927058770002e-10 else -1.90821492927058770002e-10 end;
        e_k := 1 - e_xsb - e_xsb;
      else
        f_c := case when e_xsb = 0 then 0.5 else -0.5 end;
        if abs((1.44269504088896338700e+00)::float8) >= 1e-144 and abs((1.44269504088896338700e+00)::float8) <= 1e144 and abs(e_x) >= 1e-144 and abs(e_x) <= 1e144 and abs(f_c) <= 1e288 then
          f_p := (1.44269504088896338700e+00)::float8 * e_x;
          f_bh := (e_x * 134217729 - (e_x * 134217729 - e_x));
          f_e := ((1.44269504088896338700e+00)::float8 - ((1.44269504088896338700e+00)::float8 * 134217729 - ((1.44269504088896338700e+00)::float8 * 134217729 - (1.44269504088896338700e+00)::float8))) * (e_x - f_bh) - (((f_p - ((1.44269504088896338700e+00)::float8 * 134217729 - ((1.44269504088896338700e+00)::float8 * 134217729 - (1.44269504088896338700e+00)::float8)) * f_bh) - ((1.44269504088896338700e+00)::float8 - ((1.44269504088896338700e+00)::float8 * 134217729 - ((1.44269504088896338700e+00)::float8 * 134217729 - (1.44269504088896338700e+00)::float8))) * f_bh) - ((1.44269504088896338700e+00)::float8 * 134217729 - ((1.44269504088896338700e+00)::float8 * 134217729 - (1.44269504088896338700e+00)::float8)) * (e_x - f_bh));
          f_s := f_c + f_p;
          f_tl := (f_c - (f_s - (f_s - f_c))) + (f_p - (f_s - f_c));
          f_w := (f_tl - ((f_tl + f_e) - ((f_tl + f_e) - f_tl))) + (f_e - ((f_tl + f_e) - f_tl));
          e_u := f_s + (f_tl + f_e);
          if f_w <> 0 and ((f_s - (e_u - (e_u - f_s))) + ((f_tl + f_e) - (e_u - f_s))) <> 0 and (e_u + 2 * ((f_s - (e_u - (e_u - f_s))) + ((f_tl + f_e) - (e_u - f_s)))) - e_u = 2 * ((f_s - (e_u - (e_u - f_s))) + ((f_tl + f_e) - (e_u - f_s))) and (f_w < 0) = (((f_s - (e_u - (e_u - f_s))) + ((f_tl + f_e) - (e_u - f_s))) < 0) then e_u := e_u + 2 * ((f_s - (e_u - (e_u - f_s))) + ((f_tl + f_e) - (e_u - f_s))); end if;
        elsif (1.44269504088896338700e+00)::float8 = 0 or e_x = 0 then
          e_u := (1.44269504088896338700e+00)::float8 * e_x + f_c;
        else
          e_u := fdlibm_fma_wide(a => (1.44269504088896338700e+00)::float8, b => e_x, c => f_c);
        end if;
        e_k := trunc(e_u)::int;
        e_t := e_k;
        e_hi := e_x - e_t * 6.93147180369123816490e-01;
        e_lo := e_t * 1.90821492927058770002e-10;
      end if;
      e_x := e_hi - e_lo;
    elsif e_hx < 0x3E300000 then
      w := 1 + e_x; exit;
    end if;
    e_t := e_x * e_x;
    if abs(e_t) >= 1e-144 and abs(e_t) <= 1e144 and abs((4.13813679705723846039e-08)::float8) >= 1e-144 and abs((4.13813679705723846039e-08)::float8) <= 1e144 and abs((-1.65339022054652515390e-06)::float8) <= 1e288 then
      f_p := e_t * (4.13813679705723846039e-08)::float8;
      f_ah := (e_t * 134217729 - (e_t * 134217729 - e_t));
      f_e := (e_t - f_ah) * ((4.13813679705723846039e-08)::float8 - ((4.13813679705723846039e-08)::float8 * 134217729 - ((4.13813679705723846039e-08)::float8 * 134217729 - (4.13813679705723846039e-08)::float8))) - (((f_p - f_ah * ((4.13813679705723846039e-08)::float8 * 134217729 - ((4.13813679705723846039e-08)::float8 * 134217729 - (4.13813679705723846039e-08)::float8))) - (e_t - f_ah) * ((4.13813679705723846039e-08)::float8 * 134217729 - ((4.13813679705723846039e-08)::float8 * 134217729 - (4.13813679705723846039e-08)::float8))) - f_ah * ((4.13813679705723846039e-08)::float8 - ((4.13813679705723846039e-08)::float8 * 134217729 - ((4.13813679705723846039e-08)::float8 * 134217729 - (4.13813679705723846039e-08)::float8))));
      f_s := (-1.65339022054652515390e-06)::float8 + f_p;
      f_tl := ((-1.65339022054652515390e-06)::float8 - (f_s - (f_s - (-1.65339022054652515390e-06)::float8))) + (f_p - (f_s - (-1.65339022054652515390e-06)::float8));
      f_w := (f_tl - ((f_tl + f_e) - ((f_tl + f_e) - f_tl))) + (f_e - ((f_tl + f_e) - f_tl));
      e_c := f_s + (f_tl + f_e);
      if f_w <> 0 and ((f_s - (e_c - (e_c - f_s))) + ((f_tl + f_e) - (e_c - f_s))) <> 0 and (e_c + 2 * ((f_s - (e_c - (e_c - f_s))) + ((f_tl + f_e) - (e_c - f_s)))) - e_c = 2 * ((f_s - (e_c - (e_c - f_s))) + ((f_tl + f_e) - (e_c - f_s))) and (f_w < 0) = (((f_s - (e_c - (e_c - f_s))) + ((f_tl + f_e) - (e_c - f_s))) < 0) then e_c := e_c + 2 * ((f_s - (e_c - (e_c - f_s))) + ((f_tl + f_e) - (e_c - f_s))); end if;
    elsif e_t = 0 or (4.13813679705723846039e-08)::float8 = 0 then
      e_c := e_t * (4.13813679705723846039e-08)::float8 + (-1.65339022054652515390e-06)::float8;
    else
      e_c := fdlibm_fma_wide(a => e_t, b => (4.13813679705723846039e-08)::float8, c => (-1.65339022054652515390e-06)::float8);
    end if;
    if abs(e_t) >= 1e-144 and abs(e_t) <= 1e144 and abs(e_c) >= 1e-144 and abs(e_c) <= 1e144 and abs((6.61375632143793436117e-05)::float8) <= 1e288 then
      f_p := e_t * e_c;
      f_ah := (e_t * 134217729 - (e_t * 134217729 - e_t));
      f_bh := (e_c * 134217729 - (e_c * 134217729 - e_c));
      f_e := (e_t - f_ah) * (e_c - f_bh) - (((f_p - f_ah * f_bh) - (e_t - f_ah) * f_bh) - f_ah * (e_c - f_bh));
      f_s := (6.61375632143793436117e-05)::float8 + f_p;
      f_tl := ((6.61375632143793436117e-05)::float8 - (f_s - (f_s - (6.61375632143793436117e-05)::float8))) + (f_p - (f_s - (6.61375632143793436117e-05)::float8));
      f_w := (f_tl - ((f_tl + f_e) - ((f_tl + f_e) - f_tl))) + (f_e - ((f_tl + f_e) - f_tl));
      e_c := f_s + (f_tl + f_e);
      if f_w <> 0 and ((f_s - (e_c - (e_c - f_s))) + ((f_tl + f_e) - (e_c - f_s))) <> 0 and (e_c + 2 * ((f_s - (e_c - (e_c - f_s))) + ((f_tl + f_e) - (e_c - f_s)))) - e_c = 2 * ((f_s - (e_c - (e_c - f_s))) + ((f_tl + f_e) - (e_c - f_s))) and (f_w < 0) = (((f_s - (e_c - (e_c - f_s))) + ((f_tl + f_e) - (e_c - f_s))) < 0) then e_c := e_c + 2 * ((f_s - (e_c - (e_c - f_s))) + ((f_tl + f_e) - (e_c - f_s))); end if;
    elsif e_t = 0 or e_c = 0 then
      e_c := e_t * e_c + (6.61375632143793436117e-05)::float8;
    else
      e_c := fdlibm_fma_wide(a => e_t, b => e_c, c => (6.61375632143793436117e-05)::float8);
    end if;
    if abs(e_t) >= 1e-144 and abs(e_t) <= 1e144 and abs(e_c) >= 1e-144 and abs(e_c) <= 1e144 and abs((-2.77777777770155933842e-03)::float8) <= 1e288 then
      f_p := e_t * e_c;
      f_ah := (e_t * 134217729 - (e_t * 134217729 - e_t));
      f_bh := (e_c * 134217729 - (e_c * 134217729 - e_c));
      f_e := (e_t - f_ah) * (e_c - f_bh) - (((f_p - f_ah * f_bh) - (e_t - f_ah) * f_bh) - f_ah * (e_c - f_bh));
      f_s := (-2.77777777770155933842e-03)::float8 + f_p;
      f_tl := ((-2.77777777770155933842e-03)::float8 - (f_s - (f_s - (-2.77777777770155933842e-03)::float8))) + (f_p - (f_s - (-2.77777777770155933842e-03)::float8));
      f_w := (f_tl - ((f_tl + f_e) - ((f_tl + f_e) - f_tl))) + (f_e - ((f_tl + f_e) - f_tl));
      e_c := f_s + (f_tl + f_e);
      if f_w <> 0 and ((f_s - (e_c - (e_c - f_s))) + ((f_tl + f_e) - (e_c - f_s))) <> 0 and (e_c + 2 * ((f_s - (e_c - (e_c - f_s))) + ((f_tl + f_e) - (e_c - f_s)))) - e_c = 2 * ((f_s - (e_c - (e_c - f_s))) + ((f_tl + f_e) - (e_c - f_s))) and (f_w < 0) = (((f_s - (e_c - (e_c - f_s))) + ((f_tl + f_e) - (e_c - f_s))) < 0) then e_c := e_c + 2 * ((f_s - (e_c - (e_c - f_s))) + ((f_tl + f_e) - (e_c - f_s))); end if;
    elsif e_t = 0 or e_c = 0 then
      e_c := e_t * e_c + (-2.77777777770155933842e-03)::float8;
    else
      e_c := fdlibm_fma_wide(a => e_t, b => e_c, c => (-2.77777777770155933842e-03)::float8);
    end if;
    if abs(e_t) >= 1e-144 and abs(e_t) <= 1e144 and abs(e_c) >= 1e-144 and abs(e_c) <= 1e144 and abs((1.66666666666666019037e-01)::float8) <= 1e288 then
      f_p := e_t * e_c;
      f_ah := (e_t * 134217729 - (e_t * 134217729 - e_t));
      f_bh := (e_c * 134217729 - (e_c * 134217729 - e_c));
      f_e := (e_t - f_ah) * (e_c - f_bh) - (((f_p - f_ah * f_bh) - (e_t - f_ah) * f_bh) - f_ah * (e_c - f_bh));
      f_s := (1.66666666666666019037e-01)::float8 + f_p;
      f_tl := ((1.66666666666666019037e-01)::float8 - (f_s - (f_s - (1.66666666666666019037e-01)::float8))) + (f_p - (f_s - (1.66666666666666019037e-01)::float8));
      f_w := (f_tl - ((f_tl + f_e) - ((f_tl + f_e) - f_tl))) + (f_e - ((f_tl + f_e) - f_tl));
      e_c := f_s + (f_tl + f_e);
      if f_w <> 0 and ((f_s - (e_c - (e_c - f_s))) + ((f_tl + f_e) - (e_c - f_s))) <> 0 and (e_c + 2 * ((f_s - (e_c - (e_c - f_s))) + ((f_tl + f_e) - (e_c - f_s)))) - e_c = 2 * ((f_s - (e_c - (e_c - f_s))) + ((f_tl + f_e) - (e_c - f_s))) and (f_w < 0) = (((f_s - (e_c - (e_c - f_s))) + ((f_tl + f_e) - (e_c - f_s))) < 0) then e_c := e_c + 2 * ((f_s - (e_c - (e_c - f_s))) + ((f_tl + f_e) - (e_c - f_s))); end if;
    elsif e_t = 0 or e_c = 0 then
      e_c := e_t * e_c + (1.66666666666666019037e-01)::float8;
    else
      e_c := fdlibm_fma_wide(a => e_t, b => e_c, c => (1.66666666666666019037e-01)::float8);
    end if;
    if abs(-e_t) >= 1e-144 and abs(-e_t) <= 1e144 and abs(e_c) >= 1e-144 and abs(e_c) <= 1e144 and abs(e_x) <= 1e288 then
      f_p := -e_t * e_c;
      f_ah := (-e_t * 134217729 - (-e_t * 134217729 - -e_t));
      f_bh := (e_c * 134217729 - (e_c * 134217729 - e_c));
      f_e := (-e_t - f_ah) * (e_c - f_bh) - (((f_p - f_ah * f_bh) - (-e_t - f_ah) * f_bh) - f_ah * (e_c - f_bh));
      f_s := e_x + f_p;
      f_tl := (e_x - (f_s - (f_s - e_x))) + (f_p - (f_s - e_x));
      f_w := (f_tl - ((f_tl + f_e) - ((f_tl + f_e) - f_tl))) + (f_e - ((f_tl + f_e) - f_tl));
      e_c := f_s + (f_tl + f_e);
      if f_w <> 0 and ((f_s - (e_c - (e_c - f_s))) + ((f_tl + f_e) - (e_c - f_s))) <> 0 and (e_c + 2 * ((f_s - (e_c - (e_c - f_s))) + ((f_tl + f_e) - (e_c - f_s)))) - e_c = 2 * ((f_s - (e_c - (e_c - f_s))) + ((f_tl + f_e) - (e_c - f_s))) and (f_w < 0) = (((f_s - (e_c - (e_c - f_s))) + ((f_tl + f_e) - (e_c - f_s))) < 0) then e_c := e_c + 2 * ((f_s - (e_c - (e_c - f_s))) + ((f_tl + f_e) - (e_c - f_s))); end if;
    elsif -e_t = 0 or e_c = 0 then
      e_c := -e_t * e_c + e_x;
    else
      e_c := fdlibm_fma_wide(a => -e_t, b => e_c, c => e_x);
    end if;
    if e_k = 0 then w := 1 - ((e_x * e_c) / (e_c - 2) - e_x); exit; end if;
    e_y := 1 - ((e_lo - (e_x * e_c) / (2 - e_c)) - e_hi);
    if e_k >= -1021 then
      if e_k = 1024 then w := case when e_y >= 1 then 'Infinity'::float8 else e_y * 2 * 8.988465674311579539e307 end; exit; end if;
      w := e_y * (('{2.2250738585072014e-308,4.1045368012983762e-289,7.571533991467358e-270,1.3967014978599092e-250,2.5764595078388533e-231,4.7527289157379e-212,8.767237396033612e-193,1.617269844780878e-173,2.983336292480083e-154,5.503284107318959e-135,1.0151767349262597e-115,1.8726705418768793e-96,3.454467422037778e-77,6.372367644529809e-58,1.1754943508222875e-38,2.168404344971009e-19,4,73786976294838210000,1.361129467683754e+39,2.5108406941546723e+58,4.631683569492648e+77,8.54394814368364e+96,1.5760802478557792e+116,2.9073548971824276e+135,5.363123171977039e+154,9.893216058924181e+173,1.824976247048878e+193,3.366486976990959e+212,6.210072369202836e+231,1.1455561567389984e+251,2.113178124542661e+270,3.89812560456e+289}'::float8[])[(((e_k) + 1022) >> 6) + 1] * ('{1,2,4,8,16,32,64,128,256,512,1024,2048,4096,8192,16384,32768,65536,131072,262144,524288,1048576,2097152,4194304,8388608,16777216,33554432,67108864,134217728,268435456,536870912,1073741824,2147483648,4294967296,8589934592,17179869184,34359738368,68719476736,137438953472,274877906944,549755813888,1099511627776,2199023255552,4398046511104,8796093022208,17592186044416,35184372088832,70368744177664,140737488355328,281474976710656,562949953421312,1125899906842624,2251799813685248,4503599627370496,9007199254740992,18014398509481984,36028797018963970,72057594037927940,144115188075855870,288230376151711740,576460752303423500,1152921504606847000,2305843009213694000,4611686018427388000,9223372036854776000}'::float8[])[(((e_k) + 1022) & 63) + 1]); exit;
    end if;
    e_y := e_y * (('{2.2250738585072014e-308,4.1045368012983762e-289,7.571533991467358e-270,1.3967014978599092e-250,2.5764595078388533e-231,4.7527289157379e-212,8.767237396033612e-193,1.617269844780878e-173,2.983336292480083e-154,5.503284107318959e-135,1.0151767349262597e-115,1.8726705418768793e-96,3.454467422037778e-77,6.372367644529809e-58,1.1754943508222875e-38,2.168404344971009e-19,4,73786976294838210000,1.361129467683754e+39,2.5108406941546723e+58,4.631683569492648e+77,8.54394814368364e+96,1.5760802478557792e+116,2.9073548971824276e+135,5.363123171977039e+154,9.893216058924181e+173,1.824976247048878e+193,3.366486976990959e+212,6.210072369202836e+231,1.1455561567389984e+251,2.113178124542661e+270,3.89812560456e+289}'::float8[])[(((e_k + 1000) + 1022) >> 6) + 1] * ('{1,2,4,8,16,32,64,128,256,512,1024,2048,4096,8192,16384,32768,65536,131072,262144,524288,1048576,2097152,4194304,8388608,16777216,33554432,67108864,134217728,268435456,536870912,1073741824,2147483648,4294967296,8589934592,17179869184,34359738368,68719476736,137438953472,274877906944,549755813888,1099511627776,2199023255552,4398046511104,8796093022208,17592186044416,35184372088832,70368744177664,140737488355328,281474976710656,562949953421312,1125899906842624,2251799813685248,4503599627370496,9007199254740992,18014398509481984,36028797018963970,72057594037927940,144115188075855870,288230376151711740,576460752303423500,1152921504606847000,2305843009213694000,4611686018427388000,9223372036854776000}'::float8[])[(((e_k + 1000) + 1022) & 63) + 1]);
    w := case when e_y <= 2.6469779601696886e-23 then 0 else e_y * 9.33263618503218878990e-302 end; exit;
  end loop;

    t := h * w;
    return t * w;
  end if;
  return case when x < 0 then '-Infinity'::float8 else 'Infinity'::float8 end;
end $$;
-- V8's cosh (ieee754.cc; Math.cosh). 0.5 × t is exact.
create function p3.fdlibm_cosh(x float8) returns float8 language plpgsql immutable as $$
declare f_a float8; f_b float8; f_c float8; f_p float8; f_ah float8; f_bh float8; f_e float8; f_s float8; f_tl float8; f_w float8; m_x float8; m_hx int; m_xsb boolean; m_k int; m_hi float8; m_lo float8; m_c float8; m_t float8; m_e float8; m_hxs float8; m_hfx float8; m_r1 float8; m_y float8; m_u float8;
 e_x float8; e_hx int; e_xsb int; e_hi float8; e_lo float8; e_k int; e_t float8; e_c float8; e_y float8; e_u float8;
 ix int := (int8(float8send(x)) >> 32)::int & 2147483647; t float8; w float8;
begin
  if ix < 0x3FD62E43 then
  loop
    m_x := abs(x);
    m_hx := (int8(float8send(m_x)) >> 32)::int;
    m_xsb := m_hx < 0;
    m_hx := m_hx & 2147483647;
    if m_hx >= 0x4043687A then
      if m_hx >= 0x40862E42 then
        if m_hx >= 0x7FF00000 then
          if (m_hx & 0xFFFFF) <> 0 or (int8(float8send(m_x)) & 4294967295) <> 0 then t := m_x; exit; end if;
          t := case when m_xsb then -1 else m_x end; exit;
        end if;
        if m_x > 7.09782712893383973096e+02 then t := 'Infinity'; exit; end if;
      end if;
      if m_xsb then t := -1; exit; end if;
    end if;
    if m_hx > 0x3FD62E42 then
      if m_hx < 0x3FF0A2B2 then
        if not m_xsb then
          m_hi := m_x - 6.93147180369123816490e-01; m_lo := 1.90821492927058770002e-10; m_k := 1;
        else
          m_hi := m_x + 6.93147180369123816490e-01; m_lo := -1.90821492927058770002e-10; m_k := -1;
        end if;
      else
        f_c := case when m_xsb then -0.5 else 0.5 end;
        if abs((1.44269504088896338700e+00)::float8) >= 1e-144 and abs((1.44269504088896338700e+00)::float8) <= 1e144 and abs(m_x) >= 1e-144 and abs(m_x) <= 1e144 and abs(f_c) <= 1e288 then
          f_p := (1.44269504088896338700e+00)::float8 * m_x;
          f_bh := (m_x * 134217729 - (m_x * 134217729 - m_x));
          f_e := ((1.44269504088896338700e+00)::float8 - ((1.44269504088896338700e+00)::float8 * 134217729 - ((1.44269504088896338700e+00)::float8 * 134217729 - (1.44269504088896338700e+00)::float8))) * (m_x - f_bh) - (((f_p - ((1.44269504088896338700e+00)::float8 * 134217729 - ((1.44269504088896338700e+00)::float8 * 134217729 - (1.44269504088896338700e+00)::float8)) * f_bh) - ((1.44269504088896338700e+00)::float8 - ((1.44269504088896338700e+00)::float8 * 134217729 - ((1.44269504088896338700e+00)::float8 * 134217729 - (1.44269504088896338700e+00)::float8))) * f_bh) - ((1.44269504088896338700e+00)::float8 * 134217729 - ((1.44269504088896338700e+00)::float8 * 134217729 - (1.44269504088896338700e+00)::float8)) * (m_x - f_bh));
          f_s := f_c + f_p;
          f_tl := (f_c - (f_s - (f_s - f_c))) + (f_p - (f_s - f_c));
          f_w := (f_tl - ((f_tl + f_e) - ((f_tl + f_e) - f_tl))) + (f_e - ((f_tl + f_e) - f_tl));
          m_u := f_s + (f_tl + f_e);
          if f_w <> 0 and ((f_s - (m_u - (m_u - f_s))) + ((f_tl + f_e) - (m_u - f_s))) <> 0 and (m_u + 2 * ((f_s - (m_u - (m_u - f_s))) + ((f_tl + f_e) - (m_u - f_s)))) - m_u = 2 * ((f_s - (m_u - (m_u - f_s))) + ((f_tl + f_e) - (m_u - f_s))) and (f_w < 0) = (((f_s - (m_u - (m_u - f_s))) + ((f_tl + f_e) - (m_u - f_s))) < 0) then m_u := m_u + 2 * ((f_s - (m_u - (m_u - f_s))) + ((f_tl + f_e) - (m_u - f_s))); end if;
        elsif (1.44269504088896338700e+00)::float8 = 0 or m_x = 0 then
          m_u := (1.44269504088896338700e+00)::float8 * m_x + f_c;
        else
          m_u := fdlibm_fma_wide(a => (1.44269504088896338700e+00)::float8, b => m_x, c => f_c);
        end if;
        m_k := trunc(m_u)::int;
        m_t := m_k;
        m_hi := m_x - m_t * 6.93147180369123816490e-01;
        m_lo := m_t * 1.90821492927058770002e-10;
      end if;
      m_x := m_hi - m_lo;
      m_c := (m_hi - m_x) - m_lo;
    elsif m_hx < 0x3C900000 then
      t := m_x; exit;
    else
      m_k := 0;
    end if;
    m_hfx := 0.5 * m_x;
    m_hxs := m_x * m_hfx;
    if abs(m_hxs) >= 1e-144 and abs(m_hxs) <= 1e144 and abs((-2.01099218183624371326e-07)::float8) >= 1e-144 and abs((-2.01099218183624371326e-07)::float8) <= 1e144 and abs((4.00821782732936239552e-06)::float8) <= 1e288 then
      f_p := m_hxs * (-2.01099218183624371326e-07)::float8;
      f_ah := (m_hxs * 134217729 - (m_hxs * 134217729 - m_hxs));
      f_e := (m_hxs - f_ah) * ((-2.01099218183624371326e-07)::float8 - ((-2.01099218183624371326e-07)::float8 * 134217729 - ((-2.01099218183624371326e-07)::float8 * 134217729 - (-2.01099218183624371326e-07)::float8))) - (((f_p - f_ah * ((-2.01099218183624371326e-07)::float8 * 134217729 - ((-2.01099218183624371326e-07)::float8 * 134217729 - (-2.01099218183624371326e-07)::float8))) - (m_hxs - f_ah) * ((-2.01099218183624371326e-07)::float8 * 134217729 - ((-2.01099218183624371326e-07)::float8 * 134217729 - (-2.01099218183624371326e-07)::float8))) - f_ah * ((-2.01099218183624371326e-07)::float8 - ((-2.01099218183624371326e-07)::float8 * 134217729 - ((-2.01099218183624371326e-07)::float8 * 134217729 - (-2.01099218183624371326e-07)::float8))));
      f_s := (4.00821782732936239552e-06)::float8 + f_p;
      f_tl := ((4.00821782732936239552e-06)::float8 - (f_s - (f_s - (4.00821782732936239552e-06)::float8))) + (f_p - (f_s - (4.00821782732936239552e-06)::float8));
      f_w := (f_tl - ((f_tl + f_e) - ((f_tl + f_e) - f_tl))) + (f_e - ((f_tl + f_e) - f_tl));
      m_r1 := f_s + (f_tl + f_e);
      if f_w <> 0 and ((f_s - (m_r1 - (m_r1 - f_s))) + ((f_tl + f_e) - (m_r1 - f_s))) <> 0 and (m_r1 + 2 * ((f_s - (m_r1 - (m_r1 - f_s))) + ((f_tl + f_e) - (m_r1 - f_s)))) - m_r1 = 2 * ((f_s - (m_r1 - (m_r1 - f_s))) + ((f_tl + f_e) - (m_r1 - f_s))) and (f_w < 0) = (((f_s - (m_r1 - (m_r1 - f_s))) + ((f_tl + f_e) - (m_r1 - f_s))) < 0) then m_r1 := m_r1 + 2 * ((f_s - (m_r1 - (m_r1 - f_s))) + ((f_tl + f_e) - (m_r1 - f_s))); end if;
    elsif m_hxs = 0 or (-2.01099218183624371326e-07)::float8 = 0 then
      m_r1 := m_hxs * (-2.01099218183624371326e-07)::float8 + (4.00821782732936239552e-06)::float8;
    else
      m_r1 := fdlibm_fma_wide(a => m_hxs, b => (-2.01099218183624371326e-07)::float8, c => (4.00821782732936239552e-06)::float8);
    end if;
    if abs(m_hxs) >= 1e-144 and abs(m_hxs) <= 1e144 and abs(m_r1) >= 1e-144 and abs(m_r1) <= 1e144 and abs((-7.93650757867487942473e-05)::float8) <= 1e288 then
      f_p := m_hxs * m_r1;
      f_ah := (m_hxs * 134217729 - (m_hxs * 134217729 - m_hxs));
      f_bh := (m_r1 * 134217729 - (m_r1 * 134217729 - m_r1));
      f_e := (m_hxs - f_ah) * (m_r1 - f_bh) - (((f_p - f_ah * f_bh) - (m_hxs - f_ah) * f_bh) - f_ah * (m_r1 - f_bh));
      f_s := (-7.93650757867487942473e-05)::float8 + f_p;
      f_tl := ((-7.93650757867487942473e-05)::float8 - (f_s - (f_s - (-7.93650757867487942473e-05)::float8))) + (f_p - (f_s - (-7.93650757867487942473e-05)::float8));
      f_w := (f_tl - ((f_tl + f_e) - ((f_tl + f_e) - f_tl))) + (f_e - ((f_tl + f_e) - f_tl));
      m_r1 := f_s + (f_tl + f_e);
      if f_w <> 0 and ((f_s - (m_r1 - (m_r1 - f_s))) + ((f_tl + f_e) - (m_r1 - f_s))) <> 0 and (m_r1 + 2 * ((f_s - (m_r1 - (m_r1 - f_s))) + ((f_tl + f_e) - (m_r1 - f_s)))) - m_r1 = 2 * ((f_s - (m_r1 - (m_r1 - f_s))) + ((f_tl + f_e) - (m_r1 - f_s))) and (f_w < 0) = (((f_s - (m_r1 - (m_r1 - f_s))) + ((f_tl + f_e) - (m_r1 - f_s))) < 0) then m_r1 := m_r1 + 2 * ((f_s - (m_r1 - (m_r1 - f_s))) + ((f_tl + f_e) - (m_r1 - f_s))); end if;
    elsif m_hxs = 0 or m_r1 = 0 then
      m_r1 := m_hxs * m_r1 + (-7.93650757867487942473e-05)::float8;
    else
      m_r1 := fdlibm_fma_wide(a => m_hxs, b => m_r1, c => (-7.93650757867487942473e-05)::float8);
    end if;
    if abs(m_hxs) >= 1e-144 and abs(m_hxs) <= 1e144 and abs(m_r1) >= 1e-144 and abs(m_r1) <= 1e144 and abs((1.58730158725481460165e-03)::float8) <= 1e288 then
      f_p := m_hxs * m_r1;
      f_ah := (m_hxs * 134217729 - (m_hxs * 134217729 - m_hxs));
      f_bh := (m_r1 * 134217729 - (m_r1 * 134217729 - m_r1));
      f_e := (m_hxs - f_ah) * (m_r1 - f_bh) - (((f_p - f_ah * f_bh) - (m_hxs - f_ah) * f_bh) - f_ah * (m_r1 - f_bh));
      f_s := (1.58730158725481460165e-03)::float8 + f_p;
      f_tl := ((1.58730158725481460165e-03)::float8 - (f_s - (f_s - (1.58730158725481460165e-03)::float8))) + (f_p - (f_s - (1.58730158725481460165e-03)::float8));
      f_w := (f_tl - ((f_tl + f_e) - ((f_tl + f_e) - f_tl))) + (f_e - ((f_tl + f_e) - f_tl));
      m_r1 := f_s + (f_tl + f_e);
      if f_w <> 0 and ((f_s - (m_r1 - (m_r1 - f_s))) + ((f_tl + f_e) - (m_r1 - f_s))) <> 0 and (m_r1 + 2 * ((f_s - (m_r1 - (m_r1 - f_s))) + ((f_tl + f_e) - (m_r1 - f_s)))) - m_r1 = 2 * ((f_s - (m_r1 - (m_r1 - f_s))) + ((f_tl + f_e) - (m_r1 - f_s))) and (f_w < 0) = (((f_s - (m_r1 - (m_r1 - f_s))) + ((f_tl + f_e) - (m_r1 - f_s))) < 0) then m_r1 := m_r1 + 2 * ((f_s - (m_r1 - (m_r1 - f_s))) + ((f_tl + f_e) - (m_r1 - f_s))); end if;
    elsif m_hxs = 0 or m_r1 = 0 then
      m_r1 := m_hxs * m_r1 + (1.58730158725481460165e-03)::float8;
    else
      m_r1 := fdlibm_fma_wide(a => m_hxs, b => m_r1, c => (1.58730158725481460165e-03)::float8);
    end if;
    if abs(m_hxs) >= 1e-144 and abs(m_hxs) <= 1e144 and abs(m_r1) >= 1e-144 and abs(m_r1) <= 1e144 and abs((-3.33333333333331316428e-02)::float8) <= 1e288 then
      f_p := m_hxs * m_r1;
      f_ah := (m_hxs * 134217729 - (m_hxs * 134217729 - m_hxs));
      f_bh := (m_r1 * 134217729 - (m_r1 * 134217729 - m_r1));
      f_e := (m_hxs - f_ah) * (m_r1 - f_bh) - (((f_p - f_ah * f_bh) - (m_hxs - f_ah) * f_bh) - f_ah * (m_r1 - f_bh));
      f_s := (-3.33333333333331316428e-02)::float8 + f_p;
      f_tl := ((-3.33333333333331316428e-02)::float8 - (f_s - (f_s - (-3.33333333333331316428e-02)::float8))) + (f_p - (f_s - (-3.33333333333331316428e-02)::float8));
      f_w := (f_tl - ((f_tl + f_e) - ((f_tl + f_e) - f_tl))) + (f_e - ((f_tl + f_e) - f_tl));
      m_r1 := f_s + (f_tl + f_e);
      if f_w <> 0 and ((f_s - (m_r1 - (m_r1 - f_s))) + ((f_tl + f_e) - (m_r1 - f_s))) <> 0 and (m_r1 + 2 * ((f_s - (m_r1 - (m_r1 - f_s))) + ((f_tl + f_e) - (m_r1 - f_s)))) - m_r1 = 2 * ((f_s - (m_r1 - (m_r1 - f_s))) + ((f_tl + f_e) - (m_r1 - f_s))) and (f_w < 0) = (((f_s - (m_r1 - (m_r1 - f_s))) + ((f_tl + f_e) - (m_r1 - f_s))) < 0) then m_r1 := m_r1 + 2 * ((f_s - (m_r1 - (m_r1 - f_s))) + ((f_tl + f_e) - (m_r1 - f_s))); end if;
    elsif m_hxs = 0 or m_r1 = 0 then
      m_r1 := m_hxs * m_r1 + (-3.33333333333331316428e-02)::float8;
    else
      m_r1 := fdlibm_fma_wide(a => m_hxs, b => m_r1, c => (-3.33333333333331316428e-02)::float8);
    end if;
    if abs(m_hxs) >= 1e-144 and abs(m_hxs) <= 1e144 and abs(m_r1) >= 1e-144 and abs(m_r1) <= 1e144 and abs((1)::float8) <= 1e288 then
      f_p := m_hxs * m_r1;
      f_ah := (m_hxs * 134217729 - (m_hxs * 134217729 - m_hxs));
      f_bh := (m_r1 * 134217729 - (m_r1 * 134217729 - m_r1));
      f_e := (m_hxs - f_ah) * (m_r1 - f_bh) - (((f_p - f_ah * f_bh) - (m_hxs - f_ah) * f_bh) - f_ah * (m_r1 - f_bh));
      f_s := (1)::float8 + f_p;
      f_tl := ((1)::float8 - (f_s - (f_s - (1)::float8))) + (f_p - (f_s - (1)::float8));
      f_w := (f_tl - ((f_tl + f_e) - ((f_tl + f_e) - f_tl))) + (f_e - ((f_tl + f_e) - f_tl));
      m_r1 := f_s + (f_tl + f_e);
      if f_w <> 0 and ((f_s - (m_r1 - (m_r1 - f_s))) + ((f_tl + f_e) - (m_r1 - f_s))) <> 0 and (m_r1 + 2 * ((f_s - (m_r1 - (m_r1 - f_s))) + ((f_tl + f_e) - (m_r1 - f_s)))) - m_r1 = 2 * ((f_s - (m_r1 - (m_r1 - f_s))) + ((f_tl + f_e) - (m_r1 - f_s))) and (f_w < 0) = (((f_s - (m_r1 - (m_r1 - f_s))) + ((f_tl + f_e) - (m_r1 - f_s))) < 0) then m_r1 := m_r1 + 2 * ((f_s - (m_r1 - (m_r1 - f_s))) + ((f_tl + f_e) - (m_r1 - f_s))); end if;
    elsif m_hxs = 0 or m_r1 = 0 then
      m_r1 := m_hxs * m_r1 + (1)::float8;
    else
      m_r1 := fdlibm_fma_wide(a => m_hxs, b => m_r1, c => (1)::float8);
    end if;
    if abs(-m_r1) >= 1e-144 and abs(-m_r1) <= 1e144 and abs(m_hfx) >= 1e-144 and abs(m_hfx) <= 1e144 and abs((3)::float8) <= 1e288 then
      f_p := -m_r1 * m_hfx;
      f_ah := (-m_r1 * 134217729 - (-m_r1 * 134217729 - -m_r1));
      f_bh := (m_hfx * 134217729 - (m_hfx * 134217729 - m_hfx));
      f_e := (-m_r1 - f_ah) * (m_hfx - f_bh) - (((f_p - f_ah * f_bh) - (-m_r1 - f_ah) * f_bh) - f_ah * (m_hfx - f_bh));
      f_s := (3)::float8 + f_p;
      f_tl := ((3)::float8 - (f_s - (f_s - (3)::float8))) + (f_p - (f_s - (3)::float8));
      f_w := (f_tl - ((f_tl + f_e) - ((f_tl + f_e) - f_tl))) + (f_e - ((f_tl + f_e) - f_tl));
      m_t := f_s + (f_tl + f_e);
      if f_w <> 0 and ((f_s - (m_t - (m_t - f_s))) + ((f_tl + f_e) - (m_t - f_s))) <> 0 and (m_t + 2 * ((f_s - (m_t - (m_t - f_s))) + ((f_tl + f_e) - (m_t - f_s)))) - m_t = 2 * ((f_s - (m_t - (m_t - f_s))) + ((f_tl + f_e) - (m_t - f_s))) and (f_w < 0) = (((f_s - (m_t - (m_t - f_s))) + ((f_tl + f_e) - (m_t - f_s))) < 0) then m_t := m_t + 2 * ((f_s - (m_t - (m_t - f_s))) + ((f_tl + f_e) - (m_t - f_s))); end if;
    elsif -m_r1 = 0 or m_hfx = 0 then
      m_t := -m_r1 * m_hfx + (3)::float8;
    else
      m_t := fdlibm_fma_wide(a => -m_r1, b => m_hfx, c => (3)::float8);
    end if;
    if abs(-m_x) >= 1e-144 and abs(-m_x) <= 1e144 and abs(m_t) >= 1e-144 and abs(m_t) <= 1e144 and abs((6)::float8) <= 1e288 then
      f_p := -m_x * m_t;
      f_ah := (-m_x * 134217729 - (-m_x * 134217729 - -m_x));
      f_bh := (m_t * 134217729 - (m_t * 134217729 - m_t));
      f_e := (-m_x - f_ah) * (m_t - f_bh) - (((f_p - f_ah * f_bh) - (-m_x - f_ah) * f_bh) - f_ah * (m_t - f_bh));
      f_s := (6)::float8 + f_p;
      f_tl := ((6)::float8 - (f_s - (f_s - (6)::float8))) + (f_p - (f_s - (6)::float8));
      f_w := (f_tl - ((f_tl + f_e) - ((f_tl + f_e) - f_tl))) + (f_e - ((f_tl + f_e) - f_tl));
      m_u := f_s + (f_tl + f_e);
      if f_w <> 0 and ((f_s - (m_u - (m_u - f_s))) + ((f_tl + f_e) - (m_u - f_s))) <> 0 and (m_u + 2 * ((f_s - (m_u - (m_u - f_s))) + ((f_tl + f_e) - (m_u - f_s)))) - m_u = 2 * ((f_s - (m_u - (m_u - f_s))) + ((f_tl + f_e) - (m_u - f_s))) and (f_w < 0) = (((f_s - (m_u - (m_u - f_s))) + ((f_tl + f_e) - (m_u - f_s))) < 0) then m_u := m_u + 2 * ((f_s - (m_u - (m_u - f_s))) + ((f_tl + f_e) - (m_u - f_s))); end if;
    elsif -m_x = 0 or m_t = 0 then
      m_u := -m_x * m_t + (6)::float8;
    else
      m_u := fdlibm_fma_wide(a => -m_x, b => m_t, c => (6)::float8);
    end if;
    m_e := m_hxs * ((m_r1 - m_t) / m_u);
    if m_k = 0 then
      if abs(m_x) >= 1e-144 and abs(m_x) <= 1e144 and abs(m_e) >= 1e-144 and abs(m_e) <= 1e144 and abs(-m_hxs) <= 1e288 then
        f_p := m_x * m_e;
        f_ah := (m_x * 134217729 - (m_x * 134217729 - m_x));
        f_bh := (m_e * 134217729 - (m_e * 134217729 - m_e));
        f_e := (m_x - f_ah) * (m_e - f_bh) - (((f_p - f_ah * f_bh) - (m_x - f_ah) * f_bh) - f_ah * (m_e - f_bh));
        f_s := -m_hxs + f_p;
        f_tl := (-m_hxs - (f_s - (f_s - -m_hxs))) + (f_p - (f_s - -m_hxs));
        f_w := (f_tl - ((f_tl + f_e) - ((f_tl + f_e) - f_tl))) + (f_e - ((f_tl + f_e) - f_tl));
        m_u := f_s + (f_tl + f_e);
        if f_w <> 0 and ((f_s - (m_u - (m_u - f_s))) + ((f_tl + f_e) - (m_u - f_s))) <> 0 and (m_u + 2 * ((f_s - (m_u - (m_u - f_s))) + ((f_tl + f_e) - (m_u - f_s)))) - m_u = 2 * ((f_s - (m_u - (m_u - f_s))) + ((f_tl + f_e) - (m_u - f_s))) and (f_w < 0) = (((f_s - (m_u - (m_u - f_s))) + ((f_tl + f_e) - (m_u - f_s))) < 0) then m_u := m_u + 2 * ((f_s - (m_u - (m_u - f_s))) + ((f_tl + f_e) - (m_u - f_s))); end if;
      elsif m_x = 0 or m_e = 0 then
        m_u := m_x * m_e + -m_hxs;
      else
        m_u := fdlibm_fma_wide(a => m_x, b => m_e, c => -m_hxs);
      end if;
      t := m_x - m_u; exit;
    end if;
    f_b := m_e - m_c;
    if abs(m_x) >= 1e-144 and abs(m_x) <= 1e144 and abs(f_b) >= 1e-144 and abs(f_b) <= 1e144 and abs(-m_c) <= 1e288 then
      f_p := m_x * f_b;
      f_ah := (m_x * 134217729 - (m_x * 134217729 - m_x));
      f_bh := (f_b * 134217729 - (f_b * 134217729 - f_b));
      f_e := (m_x - f_ah) * (f_b - f_bh) - (((f_p - f_ah * f_bh) - (m_x - f_ah) * f_bh) - f_ah * (f_b - f_bh));
      f_s := -m_c + f_p;
      f_tl := (-m_c - (f_s - (f_s - -m_c))) + (f_p - (f_s - -m_c));
      f_w := (f_tl - ((f_tl + f_e) - ((f_tl + f_e) - f_tl))) + (f_e - ((f_tl + f_e) - f_tl));
      m_e := f_s + (f_tl + f_e);
      if f_w <> 0 and ((f_s - (m_e - (m_e - f_s))) + ((f_tl + f_e) - (m_e - f_s))) <> 0 and (m_e + 2 * ((f_s - (m_e - (m_e - f_s))) + ((f_tl + f_e) - (m_e - f_s)))) - m_e = 2 * ((f_s - (m_e - (m_e - f_s))) + ((f_tl + f_e) - (m_e - f_s))) and (f_w < 0) = (((f_s - (m_e - (m_e - f_s))) + ((f_tl + f_e) - (m_e - f_s))) < 0) then m_e := m_e + 2 * ((f_s - (m_e - (m_e - f_s))) + ((f_tl + f_e) - (m_e - f_s))); end if;
    elsif m_x = 0 or f_b = 0 then
      m_e := m_x * f_b + -m_c;
    else
      m_e := fdlibm_fma_wide(a => m_x, b => f_b, c => -m_c);
    end if;
    m_e := m_e - m_hxs;
    if m_k = -1 then t := 0.5 * (m_x - m_e) - 0.5; exit; end if;
    if m_k = 1 then
      if m_x < -0.25 then t := -2 * (m_e - (m_x + 0.5)); exit; end if;
      t := 1 + 2 * (m_x - m_e); exit;
    end if;
    if m_k <= -2 or m_k > 56 then
      m_y := 1 - (m_e - m_x);
      if m_k = 1024 then
        if m_y >= 1 then t := 'Infinity'; exit; end if;
        m_y := m_y * 2 * 8.98846567431158e+307;
      else
        m_y := m_y * (('{2.2250738585072014e-308,4.1045368012983762e-289,7.571533991467358e-270,1.3967014978599092e-250,2.5764595078388533e-231,4.7527289157379e-212,8.767237396033612e-193,1.617269844780878e-173,2.983336292480083e-154,5.503284107318959e-135,1.0151767349262597e-115,1.8726705418768793e-96,3.454467422037778e-77,6.372367644529809e-58,1.1754943508222875e-38,2.168404344971009e-19,4,73786976294838210000,1.361129467683754e+39,2.5108406941546723e+58,4.631683569492648e+77,8.54394814368364e+96,1.5760802478557792e+116,2.9073548971824276e+135,5.363123171977039e+154,9.893216058924181e+173,1.824976247048878e+193,3.366486976990959e+212,6.210072369202836e+231,1.1455561567389984e+251,2.113178124542661e+270,3.89812560456e+289}'::float8[])[(((m_k) + 1022) >> 6) + 1] * ('{1,2,4,8,16,32,64,128,256,512,1024,2048,4096,8192,16384,32768,65536,131072,262144,524288,1048576,2097152,4194304,8388608,16777216,33554432,67108864,134217728,268435456,536870912,1073741824,2147483648,4294967296,8589934592,17179869184,34359738368,68719476736,137438953472,274877906944,549755813888,1099511627776,2199023255552,4398046511104,8796093022208,17592186044416,35184372088832,70368744177664,140737488355328,281474976710656,562949953421312,1125899906842624,2251799813685248,4503599627370496,9007199254740992,18014398509481984,36028797018963970,72057594037927940,144115188075855870,288230376151711740,576460752303423500,1152921504606847000,2305843009213694000,4611686018427388000,9223372036854776000}'::float8[])[(((m_k) + 1022) & 63) + 1]);
      end if;
      t := m_y - 1; exit;
    end if;
    if m_k < 20 then
      m_y := (1 - (('{2.2250738585072014e-308,4.1045368012983762e-289,7.571533991467358e-270,1.3967014978599092e-250,2.5764595078388533e-231,4.7527289157379e-212,8.767237396033612e-193,1.617269844780878e-173,2.983336292480083e-154,5.503284107318959e-135,1.0151767349262597e-115,1.8726705418768793e-96,3.454467422037778e-77,6.372367644529809e-58,1.1754943508222875e-38,2.168404344971009e-19,4,73786976294838210000,1.361129467683754e+39,2.5108406941546723e+58,4.631683569492648e+77,8.54394814368364e+96,1.5760802478557792e+116,2.9073548971824276e+135,5.363123171977039e+154,9.893216058924181e+173,1.824976247048878e+193,3.366486976990959e+212,6.210072369202836e+231,1.1455561567389984e+251,2.113178124542661e+270,3.89812560456e+289}'::float8[])[(((-m_k) + 1022) >> 6) + 1] * ('{1,2,4,8,16,32,64,128,256,512,1024,2048,4096,8192,16384,32768,65536,131072,262144,524288,1048576,2097152,4194304,8388608,16777216,33554432,67108864,134217728,268435456,536870912,1073741824,2147483648,4294967296,8589934592,17179869184,34359738368,68719476736,137438953472,274877906944,549755813888,1099511627776,2199023255552,4398046511104,8796093022208,17592186044416,35184372088832,70368744177664,140737488355328,281474976710656,562949953421312,1125899906842624,2251799813685248,4503599627370496,9007199254740992,18014398509481984,36028797018963970,72057594037927940,144115188075855870,288230376151711740,576460752303423500,1152921504606847000,2305843009213694000,4611686018427388000,9223372036854776000}'::float8[])[(((-m_k) + 1022) & 63) + 1])) - (m_e - m_x);
    else
      m_y := (m_x - (m_e + (('{2.2250738585072014e-308,4.1045368012983762e-289,7.571533991467358e-270,1.3967014978599092e-250,2.5764595078388533e-231,4.7527289157379e-212,8.767237396033612e-193,1.617269844780878e-173,2.983336292480083e-154,5.503284107318959e-135,1.0151767349262597e-115,1.8726705418768793e-96,3.454467422037778e-77,6.372367644529809e-58,1.1754943508222875e-38,2.168404344971009e-19,4,73786976294838210000,1.361129467683754e+39,2.5108406941546723e+58,4.631683569492648e+77,8.54394814368364e+96,1.5760802478557792e+116,2.9073548971824276e+135,5.363123171977039e+154,9.893216058924181e+173,1.824976247048878e+193,3.366486976990959e+212,6.210072369202836e+231,1.1455561567389984e+251,2.113178124542661e+270,3.89812560456e+289}'::float8[])[(((-m_k) + 1022) >> 6) + 1] * ('{1,2,4,8,16,32,64,128,256,512,1024,2048,4096,8192,16384,32768,65536,131072,262144,524288,1048576,2097152,4194304,8388608,16777216,33554432,67108864,134217728,268435456,536870912,1073741824,2147483648,4294967296,8589934592,17179869184,34359738368,68719476736,137438953472,274877906944,549755813888,1099511627776,2199023255552,4398046511104,8796093022208,17592186044416,35184372088832,70368744177664,140737488355328,281474976710656,562949953421312,1125899906842624,2251799813685248,4503599627370496,9007199254740992,18014398509481984,36028797018963970,72057594037927940,144115188075855870,288230376151711740,576460752303423500,1152921504606847000,2305843009213694000,4611686018427388000,9223372036854776000}'::float8[])[(((-m_k) + 1022) & 63) + 1]))) + 1;
    end if;
    t := m_y * (('{2.2250738585072014e-308,4.1045368012983762e-289,7.571533991467358e-270,1.3967014978599092e-250,2.5764595078388533e-231,4.7527289157379e-212,8.767237396033612e-193,1.617269844780878e-173,2.983336292480083e-154,5.503284107318959e-135,1.0151767349262597e-115,1.8726705418768793e-96,3.454467422037778e-77,6.372367644529809e-58,1.1754943508222875e-38,2.168404344971009e-19,4,73786976294838210000,1.361129467683754e+39,2.5108406941546723e+58,4.631683569492648e+77,8.54394814368364e+96,1.5760802478557792e+116,2.9073548971824276e+135,5.363123171977039e+154,9.893216058924181e+173,1.824976247048878e+193,3.366486976990959e+212,6.210072369202836e+231,1.1455561567389984e+251,2.113178124542661e+270,3.89812560456e+289}'::float8[])[(((m_k) + 1022) >> 6) + 1] * ('{1,2,4,8,16,32,64,128,256,512,1024,2048,4096,8192,16384,32768,65536,131072,262144,524288,1048576,2097152,4194304,8388608,16777216,33554432,67108864,134217728,268435456,536870912,1073741824,2147483648,4294967296,8589934592,17179869184,34359738368,68719476736,137438953472,274877906944,549755813888,1099511627776,2199023255552,4398046511104,8796093022208,17592186044416,35184372088832,70368744177664,140737488355328,281474976710656,562949953421312,1125899906842624,2251799813685248,4503599627370496,9007199254740992,18014398509481984,36028797018963970,72057594037927940,144115188075855870,288230376151711740,576460752303423500,1152921504606847000,2305843009213694000,4611686018427388000,9223372036854776000}'::float8[])[(((m_k) + 1022) & 63) + 1]); exit;
  end loop;

    w := 1 + t;
    if ix < 0x3C800000 then return w; end if;
    return 1 + (t * t) / (w + w);
  end if;
  if ix < 0x40360000 then
  loop
    e_x := abs(x);
    e_hx := (int8(float8send(e_x)) >> 32)::int;
    e_xsb := (e_hx >> 31) & 1;
    e_hi := 0;
    e_lo := 0;
    e_k := 0;
    e_hx := e_hx & 2147483647;
    if e_hx >= 0x40862E42 then
      if e_hx >= 0x7FF00000 then
        if (e_hx & 0xFFFFF) <> 0 or (int8(float8send(e_x)) & 4294967295) <> 0 then t := e_x; exit; end if;
        t := case when e_xsb = 0 then e_x else 0 end; exit;
      end if;
      if e_x > 7.09782712893383973096e+02 then t := 'Infinity'; exit; end if;
      if e_x < -7.45133219101941108420e+02 then t := 0; exit; end if;
    end if;
    if e_hx > 0x3FD62E42 then
      if e_hx < 0x3FF0A2B2 then
        if e_x = 1 then t := 2.718281828459045; exit; end if;
        e_hi := e_x - case when e_xsb = 0 then 6.93147180369123816490e-01 else -6.93147180369123816490e-01 end;
        e_lo := case when e_xsb = 0 then 1.90821492927058770002e-10 else -1.90821492927058770002e-10 end;
        e_k := 1 - e_xsb - e_xsb;
      else
        f_c := case when e_xsb = 0 then 0.5 else -0.5 end;
        if abs((1.44269504088896338700e+00)::float8) >= 1e-144 and abs((1.44269504088896338700e+00)::float8) <= 1e144 and abs(e_x) >= 1e-144 and abs(e_x) <= 1e144 and abs(f_c) <= 1e288 then
          f_p := (1.44269504088896338700e+00)::float8 * e_x;
          f_bh := (e_x * 134217729 - (e_x * 134217729 - e_x));
          f_e := ((1.44269504088896338700e+00)::float8 - ((1.44269504088896338700e+00)::float8 * 134217729 - ((1.44269504088896338700e+00)::float8 * 134217729 - (1.44269504088896338700e+00)::float8))) * (e_x - f_bh) - (((f_p - ((1.44269504088896338700e+00)::float8 * 134217729 - ((1.44269504088896338700e+00)::float8 * 134217729 - (1.44269504088896338700e+00)::float8)) * f_bh) - ((1.44269504088896338700e+00)::float8 - ((1.44269504088896338700e+00)::float8 * 134217729 - ((1.44269504088896338700e+00)::float8 * 134217729 - (1.44269504088896338700e+00)::float8))) * f_bh) - ((1.44269504088896338700e+00)::float8 * 134217729 - ((1.44269504088896338700e+00)::float8 * 134217729 - (1.44269504088896338700e+00)::float8)) * (e_x - f_bh));
          f_s := f_c + f_p;
          f_tl := (f_c - (f_s - (f_s - f_c))) + (f_p - (f_s - f_c));
          f_w := (f_tl - ((f_tl + f_e) - ((f_tl + f_e) - f_tl))) + (f_e - ((f_tl + f_e) - f_tl));
          e_u := f_s + (f_tl + f_e);
          if f_w <> 0 and ((f_s - (e_u - (e_u - f_s))) + ((f_tl + f_e) - (e_u - f_s))) <> 0 and (e_u + 2 * ((f_s - (e_u - (e_u - f_s))) + ((f_tl + f_e) - (e_u - f_s)))) - e_u = 2 * ((f_s - (e_u - (e_u - f_s))) + ((f_tl + f_e) - (e_u - f_s))) and (f_w < 0) = (((f_s - (e_u - (e_u - f_s))) + ((f_tl + f_e) - (e_u - f_s))) < 0) then e_u := e_u + 2 * ((f_s - (e_u - (e_u - f_s))) + ((f_tl + f_e) - (e_u - f_s))); end if;
        elsif (1.44269504088896338700e+00)::float8 = 0 or e_x = 0 then
          e_u := (1.44269504088896338700e+00)::float8 * e_x + f_c;
        else
          e_u := fdlibm_fma_wide(a => (1.44269504088896338700e+00)::float8, b => e_x, c => f_c);
        end if;
        e_k := trunc(e_u)::int;
        e_t := e_k;
        e_hi := e_x - e_t * 6.93147180369123816490e-01;
        e_lo := e_t * 1.90821492927058770002e-10;
      end if;
      e_x := e_hi - e_lo;
    elsif e_hx < 0x3E300000 then
      t := 1 + e_x; exit;
    end if;
    e_t := e_x * e_x;
    if abs(e_t) >= 1e-144 and abs(e_t) <= 1e144 and abs((4.13813679705723846039e-08)::float8) >= 1e-144 and abs((4.13813679705723846039e-08)::float8) <= 1e144 and abs((-1.65339022054652515390e-06)::float8) <= 1e288 then
      f_p := e_t * (4.13813679705723846039e-08)::float8;
      f_ah := (e_t * 134217729 - (e_t * 134217729 - e_t));
      f_e := (e_t - f_ah) * ((4.13813679705723846039e-08)::float8 - ((4.13813679705723846039e-08)::float8 * 134217729 - ((4.13813679705723846039e-08)::float8 * 134217729 - (4.13813679705723846039e-08)::float8))) - (((f_p - f_ah * ((4.13813679705723846039e-08)::float8 * 134217729 - ((4.13813679705723846039e-08)::float8 * 134217729 - (4.13813679705723846039e-08)::float8))) - (e_t - f_ah) * ((4.13813679705723846039e-08)::float8 * 134217729 - ((4.13813679705723846039e-08)::float8 * 134217729 - (4.13813679705723846039e-08)::float8))) - f_ah * ((4.13813679705723846039e-08)::float8 - ((4.13813679705723846039e-08)::float8 * 134217729 - ((4.13813679705723846039e-08)::float8 * 134217729 - (4.13813679705723846039e-08)::float8))));
      f_s := (-1.65339022054652515390e-06)::float8 + f_p;
      f_tl := ((-1.65339022054652515390e-06)::float8 - (f_s - (f_s - (-1.65339022054652515390e-06)::float8))) + (f_p - (f_s - (-1.65339022054652515390e-06)::float8));
      f_w := (f_tl - ((f_tl + f_e) - ((f_tl + f_e) - f_tl))) + (f_e - ((f_tl + f_e) - f_tl));
      e_c := f_s + (f_tl + f_e);
      if f_w <> 0 and ((f_s - (e_c - (e_c - f_s))) + ((f_tl + f_e) - (e_c - f_s))) <> 0 and (e_c + 2 * ((f_s - (e_c - (e_c - f_s))) + ((f_tl + f_e) - (e_c - f_s)))) - e_c = 2 * ((f_s - (e_c - (e_c - f_s))) + ((f_tl + f_e) - (e_c - f_s))) and (f_w < 0) = (((f_s - (e_c - (e_c - f_s))) + ((f_tl + f_e) - (e_c - f_s))) < 0) then e_c := e_c + 2 * ((f_s - (e_c - (e_c - f_s))) + ((f_tl + f_e) - (e_c - f_s))); end if;
    elsif e_t = 0 or (4.13813679705723846039e-08)::float8 = 0 then
      e_c := e_t * (4.13813679705723846039e-08)::float8 + (-1.65339022054652515390e-06)::float8;
    else
      e_c := fdlibm_fma_wide(a => e_t, b => (4.13813679705723846039e-08)::float8, c => (-1.65339022054652515390e-06)::float8);
    end if;
    if abs(e_t) >= 1e-144 and abs(e_t) <= 1e144 and abs(e_c) >= 1e-144 and abs(e_c) <= 1e144 and abs((6.61375632143793436117e-05)::float8) <= 1e288 then
      f_p := e_t * e_c;
      f_ah := (e_t * 134217729 - (e_t * 134217729 - e_t));
      f_bh := (e_c * 134217729 - (e_c * 134217729 - e_c));
      f_e := (e_t - f_ah) * (e_c - f_bh) - (((f_p - f_ah * f_bh) - (e_t - f_ah) * f_bh) - f_ah * (e_c - f_bh));
      f_s := (6.61375632143793436117e-05)::float8 + f_p;
      f_tl := ((6.61375632143793436117e-05)::float8 - (f_s - (f_s - (6.61375632143793436117e-05)::float8))) + (f_p - (f_s - (6.61375632143793436117e-05)::float8));
      f_w := (f_tl - ((f_tl + f_e) - ((f_tl + f_e) - f_tl))) + (f_e - ((f_tl + f_e) - f_tl));
      e_c := f_s + (f_tl + f_e);
      if f_w <> 0 and ((f_s - (e_c - (e_c - f_s))) + ((f_tl + f_e) - (e_c - f_s))) <> 0 and (e_c + 2 * ((f_s - (e_c - (e_c - f_s))) + ((f_tl + f_e) - (e_c - f_s)))) - e_c = 2 * ((f_s - (e_c - (e_c - f_s))) + ((f_tl + f_e) - (e_c - f_s))) and (f_w < 0) = (((f_s - (e_c - (e_c - f_s))) + ((f_tl + f_e) - (e_c - f_s))) < 0) then e_c := e_c + 2 * ((f_s - (e_c - (e_c - f_s))) + ((f_tl + f_e) - (e_c - f_s))); end if;
    elsif e_t = 0 or e_c = 0 then
      e_c := e_t * e_c + (6.61375632143793436117e-05)::float8;
    else
      e_c := fdlibm_fma_wide(a => e_t, b => e_c, c => (6.61375632143793436117e-05)::float8);
    end if;
    if abs(e_t) >= 1e-144 and abs(e_t) <= 1e144 and abs(e_c) >= 1e-144 and abs(e_c) <= 1e144 and abs((-2.77777777770155933842e-03)::float8) <= 1e288 then
      f_p := e_t * e_c;
      f_ah := (e_t * 134217729 - (e_t * 134217729 - e_t));
      f_bh := (e_c * 134217729 - (e_c * 134217729 - e_c));
      f_e := (e_t - f_ah) * (e_c - f_bh) - (((f_p - f_ah * f_bh) - (e_t - f_ah) * f_bh) - f_ah * (e_c - f_bh));
      f_s := (-2.77777777770155933842e-03)::float8 + f_p;
      f_tl := ((-2.77777777770155933842e-03)::float8 - (f_s - (f_s - (-2.77777777770155933842e-03)::float8))) + (f_p - (f_s - (-2.77777777770155933842e-03)::float8));
      f_w := (f_tl - ((f_tl + f_e) - ((f_tl + f_e) - f_tl))) + (f_e - ((f_tl + f_e) - f_tl));
      e_c := f_s + (f_tl + f_e);
      if f_w <> 0 and ((f_s - (e_c - (e_c - f_s))) + ((f_tl + f_e) - (e_c - f_s))) <> 0 and (e_c + 2 * ((f_s - (e_c - (e_c - f_s))) + ((f_tl + f_e) - (e_c - f_s)))) - e_c = 2 * ((f_s - (e_c - (e_c - f_s))) + ((f_tl + f_e) - (e_c - f_s))) and (f_w < 0) = (((f_s - (e_c - (e_c - f_s))) + ((f_tl + f_e) - (e_c - f_s))) < 0) then e_c := e_c + 2 * ((f_s - (e_c - (e_c - f_s))) + ((f_tl + f_e) - (e_c - f_s))); end if;
    elsif e_t = 0 or e_c = 0 then
      e_c := e_t * e_c + (-2.77777777770155933842e-03)::float8;
    else
      e_c := fdlibm_fma_wide(a => e_t, b => e_c, c => (-2.77777777770155933842e-03)::float8);
    end if;
    if abs(e_t) >= 1e-144 and abs(e_t) <= 1e144 and abs(e_c) >= 1e-144 and abs(e_c) <= 1e144 and abs((1.66666666666666019037e-01)::float8) <= 1e288 then
      f_p := e_t * e_c;
      f_ah := (e_t * 134217729 - (e_t * 134217729 - e_t));
      f_bh := (e_c * 134217729 - (e_c * 134217729 - e_c));
      f_e := (e_t - f_ah) * (e_c - f_bh) - (((f_p - f_ah * f_bh) - (e_t - f_ah) * f_bh) - f_ah * (e_c - f_bh));
      f_s := (1.66666666666666019037e-01)::float8 + f_p;
      f_tl := ((1.66666666666666019037e-01)::float8 - (f_s - (f_s - (1.66666666666666019037e-01)::float8))) + (f_p - (f_s - (1.66666666666666019037e-01)::float8));
      f_w := (f_tl - ((f_tl + f_e) - ((f_tl + f_e) - f_tl))) + (f_e - ((f_tl + f_e) - f_tl));
      e_c := f_s + (f_tl + f_e);
      if f_w <> 0 and ((f_s - (e_c - (e_c - f_s))) + ((f_tl + f_e) - (e_c - f_s))) <> 0 and (e_c + 2 * ((f_s - (e_c - (e_c - f_s))) + ((f_tl + f_e) - (e_c - f_s)))) - e_c = 2 * ((f_s - (e_c - (e_c - f_s))) + ((f_tl + f_e) - (e_c - f_s))) and (f_w < 0) = (((f_s - (e_c - (e_c - f_s))) + ((f_tl + f_e) - (e_c - f_s))) < 0) then e_c := e_c + 2 * ((f_s - (e_c - (e_c - f_s))) + ((f_tl + f_e) - (e_c - f_s))); end if;
    elsif e_t = 0 or e_c = 0 then
      e_c := e_t * e_c + (1.66666666666666019037e-01)::float8;
    else
      e_c := fdlibm_fma_wide(a => e_t, b => e_c, c => (1.66666666666666019037e-01)::float8);
    end if;
    if abs(-e_t) >= 1e-144 and abs(-e_t) <= 1e144 and abs(e_c) >= 1e-144 and abs(e_c) <= 1e144 and abs(e_x) <= 1e288 then
      f_p := -e_t * e_c;
      f_ah := (-e_t * 134217729 - (-e_t * 134217729 - -e_t));
      f_bh := (e_c * 134217729 - (e_c * 134217729 - e_c));
      f_e := (-e_t - f_ah) * (e_c - f_bh) - (((f_p - f_ah * f_bh) - (-e_t - f_ah) * f_bh) - f_ah * (e_c - f_bh));
      f_s := e_x + f_p;
      f_tl := (e_x - (f_s - (f_s - e_x))) + (f_p - (f_s - e_x));
      f_w := (f_tl - ((f_tl + f_e) - ((f_tl + f_e) - f_tl))) + (f_e - ((f_tl + f_e) - f_tl));
      e_c := f_s + (f_tl + f_e);
      if f_w <> 0 and ((f_s - (e_c - (e_c - f_s))) + ((f_tl + f_e) - (e_c - f_s))) <> 0 and (e_c + 2 * ((f_s - (e_c - (e_c - f_s))) + ((f_tl + f_e) - (e_c - f_s)))) - e_c = 2 * ((f_s - (e_c - (e_c - f_s))) + ((f_tl + f_e) - (e_c - f_s))) and (f_w < 0) = (((f_s - (e_c - (e_c - f_s))) + ((f_tl + f_e) - (e_c - f_s))) < 0) then e_c := e_c + 2 * ((f_s - (e_c - (e_c - f_s))) + ((f_tl + f_e) - (e_c - f_s))); end if;
    elsif -e_t = 0 or e_c = 0 then
      e_c := -e_t * e_c + e_x;
    else
      e_c := fdlibm_fma_wide(a => -e_t, b => e_c, c => e_x);
    end if;
    if e_k = 0 then t := 1 - ((e_x * e_c) / (e_c - 2) - e_x); exit; end if;
    e_y := 1 - ((e_lo - (e_x * e_c) / (2 - e_c)) - e_hi);
    if e_k >= -1021 then
      if e_k = 1024 then t := case when e_y >= 1 then 'Infinity'::float8 else e_y * 2 * 8.988465674311579539e307 end; exit; end if;
      t := e_y * (('{2.2250738585072014e-308,4.1045368012983762e-289,7.571533991467358e-270,1.3967014978599092e-250,2.5764595078388533e-231,4.7527289157379e-212,8.767237396033612e-193,1.617269844780878e-173,2.983336292480083e-154,5.503284107318959e-135,1.0151767349262597e-115,1.8726705418768793e-96,3.454467422037778e-77,6.372367644529809e-58,1.1754943508222875e-38,2.168404344971009e-19,4,73786976294838210000,1.361129467683754e+39,2.5108406941546723e+58,4.631683569492648e+77,8.54394814368364e+96,1.5760802478557792e+116,2.9073548971824276e+135,5.363123171977039e+154,9.893216058924181e+173,1.824976247048878e+193,3.366486976990959e+212,6.210072369202836e+231,1.1455561567389984e+251,2.113178124542661e+270,3.89812560456e+289}'::float8[])[(((e_k) + 1022) >> 6) + 1] * ('{1,2,4,8,16,32,64,128,256,512,1024,2048,4096,8192,16384,32768,65536,131072,262144,524288,1048576,2097152,4194304,8388608,16777216,33554432,67108864,134217728,268435456,536870912,1073741824,2147483648,4294967296,8589934592,17179869184,34359738368,68719476736,137438953472,274877906944,549755813888,1099511627776,2199023255552,4398046511104,8796093022208,17592186044416,35184372088832,70368744177664,140737488355328,281474976710656,562949953421312,1125899906842624,2251799813685248,4503599627370496,9007199254740992,18014398509481984,36028797018963970,72057594037927940,144115188075855870,288230376151711740,576460752303423500,1152921504606847000,2305843009213694000,4611686018427388000,9223372036854776000}'::float8[])[(((e_k) + 1022) & 63) + 1]); exit;
    end if;
    e_y := e_y * (('{2.2250738585072014e-308,4.1045368012983762e-289,7.571533991467358e-270,1.3967014978599092e-250,2.5764595078388533e-231,4.7527289157379e-212,8.767237396033612e-193,1.617269844780878e-173,2.983336292480083e-154,5.503284107318959e-135,1.0151767349262597e-115,1.8726705418768793e-96,3.454467422037778e-77,6.372367644529809e-58,1.1754943508222875e-38,2.168404344971009e-19,4,73786976294838210000,1.361129467683754e+39,2.5108406941546723e+58,4.631683569492648e+77,8.54394814368364e+96,1.5760802478557792e+116,2.9073548971824276e+135,5.363123171977039e+154,9.893216058924181e+173,1.824976247048878e+193,3.366486976990959e+212,6.210072369202836e+231,1.1455561567389984e+251,2.113178124542661e+270,3.89812560456e+289}'::float8[])[(((e_k + 1000) + 1022) >> 6) + 1] * ('{1,2,4,8,16,32,64,128,256,512,1024,2048,4096,8192,16384,32768,65536,131072,262144,524288,1048576,2097152,4194304,8388608,16777216,33554432,67108864,134217728,268435456,536870912,1073741824,2147483648,4294967296,8589934592,17179869184,34359738368,68719476736,137438953472,274877906944,549755813888,1099511627776,2199023255552,4398046511104,8796093022208,17592186044416,35184372088832,70368744177664,140737488355328,281474976710656,562949953421312,1125899906842624,2251799813685248,4503599627370496,9007199254740992,18014398509481984,36028797018963970,72057594037927940,144115188075855870,288230376151711740,576460752303423500,1152921504606847000,2305843009213694000,4611686018427388000,9223372036854776000}'::float8[])[(((e_k + 1000) + 1022) & 63) + 1]);
    t := case when e_y <= 2.6469779601696886e-23 then 0 else e_y * 9.33263618503218878990e-302 end; exit;
  end loop;

    return 0.5 * t + 0.5 / t;
  end if;
  if ix < 0x40862E42 then
  loop
    e_x := abs(x);
    e_hx := (int8(float8send(e_x)) >> 32)::int;
    e_xsb := (e_hx >> 31) & 1;
    e_hi := 0;
    e_lo := 0;
    e_k := 0;
    e_hx := e_hx & 2147483647;
    if e_hx >= 0x40862E42 then
      if e_hx >= 0x7FF00000 then
        if (e_hx & 0xFFFFF) <> 0 or (int8(float8send(e_x)) & 4294967295) <> 0 then t := e_x; exit; end if;
        t := case when e_xsb = 0 then e_x else 0 end; exit;
      end if;
      if e_x > 7.09782712893383973096e+02 then t := 'Infinity'; exit; end if;
      if e_x < -7.45133219101941108420e+02 then t := 0; exit; end if;
    end if;
    if e_hx > 0x3FD62E42 then
      if e_hx < 0x3FF0A2B2 then
        if e_x = 1 then t := 2.718281828459045; exit; end if;
        e_hi := e_x - case when e_xsb = 0 then 6.93147180369123816490e-01 else -6.93147180369123816490e-01 end;
        e_lo := case when e_xsb = 0 then 1.90821492927058770002e-10 else -1.90821492927058770002e-10 end;
        e_k := 1 - e_xsb - e_xsb;
      else
        f_c := case when e_xsb = 0 then 0.5 else -0.5 end;
        if abs((1.44269504088896338700e+00)::float8) >= 1e-144 and abs((1.44269504088896338700e+00)::float8) <= 1e144 and abs(e_x) >= 1e-144 and abs(e_x) <= 1e144 and abs(f_c) <= 1e288 then
          f_p := (1.44269504088896338700e+00)::float8 * e_x;
          f_bh := (e_x * 134217729 - (e_x * 134217729 - e_x));
          f_e := ((1.44269504088896338700e+00)::float8 - ((1.44269504088896338700e+00)::float8 * 134217729 - ((1.44269504088896338700e+00)::float8 * 134217729 - (1.44269504088896338700e+00)::float8))) * (e_x - f_bh) - (((f_p - ((1.44269504088896338700e+00)::float8 * 134217729 - ((1.44269504088896338700e+00)::float8 * 134217729 - (1.44269504088896338700e+00)::float8)) * f_bh) - ((1.44269504088896338700e+00)::float8 - ((1.44269504088896338700e+00)::float8 * 134217729 - ((1.44269504088896338700e+00)::float8 * 134217729 - (1.44269504088896338700e+00)::float8))) * f_bh) - ((1.44269504088896338700e+00)::float8 * 134217729 - ((1.44269504088896338700e+00)::float8 * 134217729 - (1.44269504088896338700e+00)::float8)) * (e_x - f_bh));
          f_s := f_c + f_p;
          f_tl := (f_c - (f_s - (f_s - f_c))) + (f_p - (f_s - f_c));
          f_w := (f_tl - ((f_tl + f_e) - ((f_tl + f_e) - f_tl))) + (f_e - ((f_tl + f_e) - f_tl));
          e_u := f_s + (f_tl + f_e);
          if f_w <> 0 and ((f_s - (e_u - (e_u - f_s))) + ((f_tl + f_e) - (e_u - f_s))) <> 0 and (e_u + 2 * ((f_s - (e_u - (e_u - f_s))) + ((f_tl + f_e) - (e_u - f_s)))) - e_u = 2 * ((f_s - (e_u - (e_u - f_s))) + ((f_tl + f_e) - (e_u - f_s))) and (f_w < 0) = (((f_s - (e_u - (e_u - f_s))) + ((f_tl + f_e) - (e_u - f_s))) < 0) then e_u := e_u + 2 * ((f_s - (e_u - (e_u - f_s))) + ((f_tl + f_e) - (e_u - f_s))); end if;
        elsif (1.44269504088896338700e+00)::float8 = 0 or e_x = 0 then
          e_u := (1.44269504088896338700e+00)::float8 * e_x + f_c;
        else
          e_u := fdlibm_fma_wide(a => (1.44269504088896338700e+00)::float8, b => e_x, c => f_c);
        end if;
        e_k := trunc(e_u)::int;
        e_t := e_k;
        e_hi := e_x - e_t * 6.93147180369123816490e-01;
        e_lo := e_t * 1.90821492927058770002e-10;
      end if;
      e_x := e_hi - e_lo;
    elsif e_hx < 0x3E300000 then
      t := 1 + e_x; exit;
    end if;
    e_t := e_x * e_x;
    if abs(e_t) >= 1e-144 and abs(e_t) <= 1e144 and abs((4.13813679705723846039e-08)::float8) >= 1e-144 and abs((4.13813679705723846039e-08)::float8) <= 1e144 and abs((-1.65339022054652515390e-06)::float8) <= 1e288 then
      f_p := e_t * (4.13813679705723846039e-08)::float8;
      f_ah := (e_t * 134217729 - (e_t * 134217729 - e_t));
      f_e := (e_t - f_ah) * ((4.13813679705723846039e-08)::float8 - ((4.13813679705723846039e-08)::float8 * 134217729 - ((4.13813679705723846039e-08)::float8 * 134217729 - (4.13813679705723846039e-08)::float8))) - (((f_p - f_ah * ((4.13813679705723846039e-08)::float8 * 134217729 - ((4.13813679705723846039e-08)::float8 * 134217729 - (4.13813679705723846039e-08)::float8))) - (e_t - f_ah) * ((4.13813679705723846039e-08)::float8 * 134217729 - ((4.13813679705723846039e-08)::float8 * 134217729 - (4.13813679705723846039e-08)::float8))) - f_ah * ((4.13813679705723846039e-08)::float8 - ((4.13813679705723846039e-08)::float8 * 134217729 - ((4.13813679705723846039e-08)::float8 * 134217729 - (4.13813679705723846039e-08)::float8))));
      f_s := (-1.65339022054652515390e-06)::float8 + f_p;
      f_tl := ((-1.65339022054652515390e-06)::float8 - (f_s - (f_s - (-1.65339022054652515390e-06)::float8))) + (f_p - (f_s - (-1.65339022054652515390e-06)::float8));
      f_w := (f_tl - ((f_tl + f_e) - ((f_tl + f_e) - f_tl))) + (f_e - ((f_tl + f_e) - f_tl));
      e_c := f_s + (f_tl + f_e);
      if f_w <> 0 and ((f_s - (e_c - (e_c - f_s))) + ((f_tl + f_e) - (e_c - f_s))) <> 0 and (e_c + 2 * ((f_s - (e_c - (e_c - f_s))) + ((f_tl + f_e) - (e_c - f_s)))) - e_c = 2 * ((f_s - (e_c - (e_c - f_s))) + ((f_tl + f_e) - (e_c - f_s))) and (f_w < 0) = (((f_s - (e_c - (e_c - f_s))) + ((f_tl + f_e) - (e_c - f_s))) < 0) then e_c := e_c + 2 * ((f_s - (e_c - (e_c - f_s))) + ((f_tl + f_e) - (e_c - f_s))); end if;
    elsif e_t = 0 or (4.13813679705723846039e-08)::float8 = 0 then
      e_c := e_t * (4.13813679705723846039e-08)::float8 + (-1.65339022054652515390e-06)::float8;
    else
      e_c := fdlibm_fma_wide(a => e_t, b => (4.13813679705723846039e-08)::float8, c => (-1.65339022054652515390e-06)::float8);
    end if;
    if abs(e_t) >= 1e-144 and abs(e_t) <= 1e144 and abs(e_c) >= 1e-144 and abs(e_c) <= 1e144 and abs((6.61375632143793436117e-05)::float8) <= 1e288 then
      f_p := e_t * e_c;
      f_ah := (e_t * 134217729 - (e_t * 134217729 - e_t));
      f_bh := (e_c * 134217729 - (e_c * 134217729 - e_c));
      f_e := (e_t - f_ah) * (e_c - f_bh) - (((f_p - f_ah * f_bh) - (e_t - f_ah) * f_bh) - f_ah * (e_c - f_bh));
      f_s := (6.61375632143793436117e-05)::float8 + f_p;
      f_tl := ((6.61375632143793436117e-05)::float8 - (f_s - (f_s - (6.61375632143793436117e-05)::float8))) + (f_p - (f_s - (6.61375632143793436117e-05)::float8));
      f_w := (f_tl - ((f_tl + f_e) - ((f_tl + f_e) - f_tl))) + (f_e - ((f_tl + f_e) - f_tl));
      e_c := f_s + (f_tl + f_e);
      if f_w <> 0 and ((f_s - (e_c - (e_c - f_s))) + ((f_tl + f_e) - (e_c - f_s))) <> 0 and (e_c + 2 * ((f_s - (e_c - (e_c - f_s))) + ((f_tl + f_e) - (e_c - f_s)))) - e_c = 2 * ((f_s - (e_c - (e_c - f_s))) + ((f_tl + f_e) - (e_c - f_s))) and (f_w < 0) = (((f_s - (e_c - (e_c - f_s))) + ((f_tl + f_e) - (e_c - f_s))) < 0) then e_c := e_c + 2 * ((f_s - (e_c - (e_c - f_s))) + ((f_tl + f_e) - (e_c - f_s))); end if;
    elsif e_t = 0 or e_c = 0 then
      e_c := e_t * e_c + (6.61375632143793436117e-05)::float8;
    else
      e_c := fdlibm_fma_wide(a => e_t, b => e_c, c => (6.61375632143793436117e-05)::float8);
    end if;
    if abs(e_t) >= 1e-144 and abs(e_t) <= 1e144 and abs(e_c) >= 1e-144 and abs(e_c) <= 1e144 and abs((-2.77777777770155933842e-03)::float8) <= 1e288 then
      f_p := e_t * e_c;
      f_ah := (e_t * 134217729 - (e_t * 134217729 - e_t));
      f_bh := (e_c * 134217729 - (e_c * 134217729 - e_c));
      f_e := (e_t - f_ah) * (e_c - f_bh) - (((f_p - f_ah * f_bh) - (e_t - f_ah) * f_bh) - f_ah * (e_c - f_bh));
      f_s := (-2.77777777770155933842e-03)::float8 + f_p;
      f_tl := ((-2.77777777770155933842e-03)::float8 - (f_s - (f_s - (-2.77777777770155933842e-03)::float8))) + (f_p - (f_s - (-2.77777777770155933842e-03)::float8));
      f_w := (f_tl - ((f_tl + f_e) - ((f_tl + f_e) - f_tl))) + (f_e - ((f_tl + f_e) - f_tl));
      e_c := f_s + (f_tl + f_e);
      if f_w <> 0 and ((f_s - (e_c - (e_c - f_s))) + ((f_tl + f_e) - (e_c - f_s))) <> 0 and (e_c + 2 * ((f_s - (e_c - (e_c - f_s))) + ((f_tl + f_e) - (e_c - f_s)))) - e_c = 2 * ((f_s - (e_c - (e_c - f_s))) + ((f_tl + f_e) - (e_c - f_s))) and (f_w < 0) = (((f_s - (e_c - (e_c - f_s))) + ((f_tl + f_e) - (e_c - f_s))) < 0) then e_c := e_c + 2 * ((f_s - (e_c - (e_c - f_s))) + ((f_tl + f_e) - (e_c - f_s))); end if;
    elsif e_t = 0 or e_c = 0 then
      e_c := e_t * e_c + (-2.77777777770155933842e-03)::float8;
    else
      e_c := fdlibm_fma_wide(a => e_t, b => e_c, c => (-2.77777777770155933842e-03)::float8);
    end if;
    if abs(e_t) >= 1e-144 and abs(e_t) <= 1e144 and abs(e_c) >= 1e-144 and abs(e_c) <= 1e144 and abs((1.66666666666666019037e-01)::float8) <= 1e288 then
      f_p := e_t * e_c;
      f_ah := (e_t * 134217729 - (e_t * 134217729 - e_t));
      f_bh := (e_c * 134217729 - (e_c * 134217729 - e_c));
      f_e := (e_t - f_ah) * (e_c - f_bh) - (((f_p - f_ah * f_bh) - (e_t - f_ah) * f_bh) - f_ah * (e_c - f_bh));
      f_s := (1.66666666666666019037e-01)::float8 + f_p;
      f_tl := ((1.66666666666666019037e-01)::float8 - (f_s - (f_s - (1.66666666666666019037e-01)::float8))) + (f_p - (f_s - (1.66666666666666019037e-01)::float8));
      f_w := (f_tl - ((f_tl + f_e) - ((f_tl + f_e) - f_tl))) + (f_e - ((f_tl + f_e) - f_tl));
      e_c := f_s + (f_tl + f_e);
      if f_w <> 0 and ((f_s - (e_c - (e_c - f_s))) + ((f_tl + f_e) - (e_c - f_s))) <> 0 and (e_c + 2 * ((f_s - (e_c - (e_c - f_s))) + ((f_tl + f_e) - (e_c - f_s)))) - e_c = 2 * ((f_s - (e_c - (e_c - f_s))) + ((f_tl + f_e) - (e_c - f_s))) and (f_w < 0) = (((f_s - (e_c - (e_c - f_s))) + ((f_tl + f_e) - (e_c - f_s))) < 0) then e_c := e_c + 2 * ((f_s - (e_c - (e_c - f_s))) + ((f_tl + f_e) - (e_c - f_s))); end if;
    elsif e_t = 0 or e_c = 0 then
      e_c := e_t * e_c + (1.66666666666666019037e-01)::float8;
    else
      e_c := fdlibm_fma_wide(a => e_t, b => e_c, c => (1.66666666666666019037e-01)::float8);
    end if;
    if abs(-e_t) >= 1e-144 and abs(-e_t) <= 1e144 and abs(e_c) >= 1e-144 and abs(e_c) <= 1e144 and abs(e_x) <= 1e288 then
      f_p := -e_t * e_c;
      f_ah := (-e_t * 134217729 - (-e_t * 134217729 - -e_t));
      f_bh := (e_c * 134217729 - (e_c * 134217729 - e_c));
      f_e := (-e_t - f_ah) * (e_c - f_bh) - (((f_p - f_ah * f_bh) - (-e_t - f_ah) * f_bh) - f_ah * (e_c - f_bh));
      f_s := e_x + f_p;
      f_tl := (e_x - (f_s - (f_s - e_x))) + (f_p - (f_s - e_x));
      f_w := (f_tl - ((f_tl + f_e) - ((f_tl + f_e) - f_tl))) + (f_e - ((f_tl + f_e) - f_tl));
      e_c := f_s + (f_tl + f_e);
      if f_w <> 0 and ((f_s - (e_c - (e_c - f_s))) + ((f_tl + f_e) - (e_c - f_s))) <> 0 and (e_c + 2 * ((f_s - (e_c - (e_c - f_s))) + ((f_tl + f_e) - (e_c - f_s)))) - e_c = 2 * ((f_s - (e_c - (e_c - f_s))) + ((f_tl + f_e) - (e_c - f_s))) and (f_w < 0) = (((f_s - (e_c - (e_c - f_s))) + ((f_tl + f_e) - (e_c - f_s))) < 0) then e_c := e_c + 2 * ((f_s - (e_c - (e_c - f_s))) + ((f_tl + f_e) - (e_c - f_s))); end if;
    elsif -e_t = 0 or e_c = 0 then
      e_c := -e_t * e_c + e_x;
    else
      e_c := fdlibm_fma_wide(a => -e_t, b => e_c, c => e_x);
    end if;
    if e_k = 0 then t := 1 - ((e_x * e_c) / (e_c - 2) - e_x); exit; end if;
    e_y := 1 - ((e_lo - (e_x * e_c) / (2 - e_c)) - e_hi);
    if e_k >= -1021 then
      if e_k = 1024 then t := case when e_y >= 1 then 'Infinity'::float8 else e_y * 2 * 8.988465674311579539e307 end; exit; end if;
      t := e_y * (('{2.2250738585072014e-308,4.1045368012983762e-289,7.571533991467358e-270,1.3967014978599092e-250,2.5764595078388533e-231,4.7527289157379e-212,8.767237396033612e-193,1.617269844780878e-173,2.983336292480083e-154,5.503284107318959e-135,1.0151767349262597e-115,1.8726705418768793e-96,3.454467422037778e-77,6.372367644529809e-58,1.1754943508222875e-38,2.168404344971009e-19,4,73786976294838210000,1.361129467683754e+39,2.5108406941546723e+58,4.631683569492648e+77,8.54394814368364e+96,1.5760802478557792e+116,2.9073548971824276e+135,5.363123171977039e+154,9.893216058924181e+173,1.824976247048878e+193,3.366486976990959e+212,6.210072369202836e+231,1.1455561567389984e+251,2.113178124542661e+270,3.89812560456e+289}'::float8[])[(((e_k) + 1022) >> 6) + 1] * ('{1,2,4,8,16,32,64,128,256,512,1024,2048,4096,8192,16384,32768,65536,131072,262144,524288,1048576,2097152,4194304,8388608,16777216,33554432,67108864,134217728,268435456,536870912,1073741824,2147483648,4294967296,8589934592,17179869184,34359738368,68719476736,137438953472,274877906944,549755813888,1099511627776,2199023255552,4398046511104,8796093022208,17592186044416,35184372088832,70368744177664,140737488355328,281474976710656,562949953421312,1125899906842624,2251799813685248,4503599627370496,9007199254740992,18014398509481984,36028797018963970,72057594037927940,144115188075855870,288230376151711740,576460752303423500,1152921504606847000,2305843009213694000,4611686018427388000,9223372036854776000}'::float8[])[(((e_k) + 1022) & 63) + 1]); exit;
    end if;
    e_y := e_y * (('{2.2250738585072014e-308,4.1045368012983762e-289,7.571533991467358e-270,1.3967014978599092e-250,2.5764595078388533e-231,4.7527289157379e-212,8.767237396033612e-193,1.617269844780878e-173,2.983336292480083e-154,5.503284107318959e-135,1.0151767349262597e-115,1.8726705418768793e-96,3.454467422037778e-77,6.372367644529809e-58,1.1754943508222875e-38,2.168404344971009e-19,4,73786976294838210000,1.361129467683754e+39,2.5108406941546723e+58,4.631683569492648e+77,8.54394814368364e+96,1.5760802478557792e+116,2.9073548971824276e+135,5.363123171977039e+154,9.893216058924181e+173,1.824976247048878e+193,3.366486976990959e+212,6.210072369202836e+231,1.1455561567389984e+251,2.113178124542661e+270,3.89812560456e+289}'::float8[])[(((e_k + 1000) + 1022) >> 6) + 1] * ('{1,2,4,8,16,32,64,128,256,512,1024,2048,4096,8192,16384,32768,65536,131072,262144,524288,1048576,2097152,4194304,8388608,16777216,33554432,67108864,134217728,268435456,536870912,1073741824,2147483648,4294967296,8589934592,17179869184,34359738368,68719476736,137438953472,274877906944,549755813888,1099511627776,2199023255552,4398046511104,8796093022208,17592186044416,35184372088832,70368744177664,140737488355328,281474976710656,562949953421312,1125899906842624,2251799813685248,4503599627370496,9007199254740992,18014398509481984,36028797018963970,72057594037927940,144115188075855870,288230376151711740,576460752303423500,1152921504606847000,2305843009213694000,4611686018427388000,9223372036854776000}'::float8[])[(((e_k + 1000) + 1022) & 63) + 1]);
    t := case when e_y <= 2.6469779601696886e-23 then 0 else e_y * 9.33263618503218878990e-302 end; exit;
  end loop;

    return 0.5 * t;
  end if;
  if abs(x) <= 710.4758600739439 then
  loop
    e_x := 0.5 * abs(x);
    e_hx := (int8(float8send(e_x)) >> 32)::int;
    e_xsb := (e_hx >> 31) & 1;
    e_hi := 0;
    e_lo := 0;
    e_k := 0;
    e_hx := e_hx & 2147483647;
    if e_hx >= 0x40862E42 then
      if e_hx >= 0x7FF00000 then
        if (e_hx & 0xFFFFF) <> 0 or (int8(float8send(e_x)) & 4294967295) <> 0 then w := e_x; exit; end if;
        w := case when e_xsb = 0 then e_x else 0 end; exit;
      end if;
      if e_x > 7.09782712893383973096e+02 then w := 'Infinity'; exit; end if;
      if e_x < -7.45133219101941108420e+02 then w := 0; exit; end if;
    end if;
    if e_hx > 0x3FD62E42 then
      if e_hx < 0x3FF0A2B2 then
        if e_x = 1 then w := 2.718281828459045; exit; end if;
        e_hi := e_x - case when e_xsb = 0 then 6.93147180369123816490e-01 else -6.93147180369123816490e-01 end;
        e_lo := case when e_xsb = 0 then 1.90821492927058770002e-10 else -1.90821492927058770002e-10 end;
        e_k := 1 - e_xsb - e_xsb;
      else
        f_c := case when e_xsb = 0 then 0.5 else -0.5 end;
        if abs((1.44269504088896338700e+00)::float8) >= 1e-144 and abs((1.44269504088896338700e+00)::float8) <= 1e144 and abs(e_x) >= 1e-144 and abs(e_x) <= 1e144 and abs(f_c) <= 1e288 then
          f_p := (1.44269504088896338700e+00)::float8 * e_x;
          f_bh := (e_x * 134217729 - (e_x * 134217729 - e_x));
          f_e := ((1.44269504088896338700e+00)::float8 - ((1.44269504088896338700e+00)::float8 * 134217729 - ((1.44269504088896338700e+00)::float8 * 134217729 - (1.44269504088896338700e+00)::float8))) * (e_x - f_bh) - (((f_p - ((1.44269504088896338700e+00)::float8 * 134217729 - ((1.44269504088896338700e+00)::float8 * 134217729 - (1.44269504088896338700e+00)::float8)) * f_bh) - ((1.44269504088896338700e+00)::float8 - ((1.44269504088896338700e+00)::float8 * 134217729 - ((1.44269504088896338700e+00)::float8 * 134217729 - (1.44269504088896338700e+00)::float8))) * f_bh) - ((1.44269504088896338700e+00)::float8 * 134217729 - ((1.44269504088896338700e+00)::float8 * 134217729 - (1.44269504088896338700e+00)::float8)) * (e_x - f_bh));
          f_s := f_c + f_p;
          f_tl := (f_c - (f_s - (f_s - f_c))) + (f_p - (f_s - f_c));
          f_w := (f_tl - ((f_tl + f_e) - ((f_tl + f_e) - f_tl))) + (f_e - ((f_tl + f_e) - f_tl));
          e_u := f_s + (f_tl + f_e);
          if f_w <> 0 and ((f_s - (e_u - (e_u - f_s))) + ((f_tl + f_e) - (e_u - f_s))) <> 0 and (e_u + 2 * ((f_s - (e_u - (e_u - f_s))) + ((f_tl + f_e) - (e_u - f_s)))) - e_u = 2 * ((f_s - (e_u - (e_u - f_s))) + ((f_tl + f_e) - (e_u - f_s))) and (f_w < 0) = (((f_s - (e_u - (e_u - f_s))) + ((f_tl + f_e) - (e_u - f_s))) < 0) then e_u := e_u + 2 * ((f_s - (e_u - (e_u - f_s))) + ((f_tl + f_e) - (e_u - f_s))); end if;
        elsif (1.44269504088896338700e+00)::float8 = 0 or e_x = 0 then
          e_u := (1.44269504088896338700e+00)::float8 * e_x + f_c;
        else
          e_u := fdlibm_fma_wide(a => (1.44269504088896338700e+00)::float8, b => e_x, c => f_c);
        end if;
        e_k := trunc(e_u)::int;
        e_t := e_k;
        e_hi := e_x - e_t * 6.93147180369123816490e-01;
        e_lo := e_t * 1.90821492927058770002e-10;
      end if;
      e_x := e_hi - e_lo;
    elsif e_hx < 0x3E300000 then
      w := 1 + e_x; exit;
    end if;
    e_t := e_x * e_x;
    if abs(e_t) >= 1e-144 and abs(e_t) <= 1e144 and abs((4.13813679705723846039e-08)::float8) >= 1e-144 and abs((4.13813679705723846039e-08)::float8) <= 1e144 and abs((-1.65339022054652515390e-06)::float8) <= 1e288 then
      f_p := e_t * (4.13813679705723846039e-08)::float8;
      f_ah := (e_t * 134217729 - (e_t * 134217729 - e_t));
      f_e := (e_t - f_ah) * ((4.13813679705723846039e-08)::float8 - ((4.13813679705723846039e-08)::float8 * 134217729 - ((4.13813679705723846039e-08)::float8 * 134217729 - (4.13813679705723846039e-08)::float8))) - (((f_p - f_ah * ((4.13813679705723846039e-08)::float8 * 134217729 - ((4.13813679705723846039e-08)::float8 * 134217729 - (4.13813679705723846039e-08)::float8))) - (e_t - f_ah) * ((4.13813679705723846039e-08)::float8 * 134217729 - ((4.13813679705723846039e-08)::float8 * 134217729 - (4.13813679705723846039e-08)::float8))) - f_ah * ((4.13813679705723846039e-08)::float8 - ((4.13813679705723846039e-08)::float8 * 134217729 - ((4.13813679705723846039e-08)::float8 * 134217729 - (4.13813679705723846039e-08)::float8))));
      f_s := (-1.65339022054652515390e-06)::float8 + f_p;
      f_tl := ((-1.65339022054652515390e-06)::float8 - (f_s - (f_s - (-1.65339022054652515390e-06)::float8))) + (f_p - (f_s - (-1.65339022054652515390e-06)::float8));
      f_w := (f_tl - ((f_tl + f_e) - ((f_tl + f_e) - f_tl))) + (f_e - ((f_tl + f_e) - f_tl));
      e_c := f_s + (f_tl + f_e);
      if f_w <> 0 and ((f_s - (e_c - (e_c - f_s))) + ((f_tl + f_e) - (e_c - f_s))) <> 0 and (e_c + 2 * ((f_s - (e_c - (e_c - f_s))) + ((f_tl + f_e) - (e_c - f_s)))) - e_c = 2 * ((f_s - (e_c - (e_c - f_s))) + ((f_tl + f_e) - (e_c - f_s))) and (f_w < 0) = (((f_s - (e_c - (e_c - f_s))) + ((f_tl + f_e) - (e_c - f_s))) < 0) then e_c := e_c + 2 * ((f_s - (e_c - (e_c - f_s))) + ((f_tl + f_e) - (e_c - f_s))); end if;
    elsif e_t = 0 or (4.13813679705723846039e-08)::float8 = 0 then
      e_c := e_t * (4.13813679705723846039e-08)::float8 + (-1.65339022054652515390e-06)::float8;
    else
      e_c := fdlibm_fma_wide(a => e_t, b => (4.13813679705723846039e-08)::float8, c => (-1.65339022054652515390e-06)::float8);
    end if;
    if abs(e_t) >= 1e-144 and abs(e_t) <= 1e144 and abs(e_c) >= 1e-144 and abs(e_c) <= 1e144 and abs((6.61375632143793436117e-05)::float8) <= 1e288 then
      f_p := e_t * e_c;
      f_ah := (e_t * 134217729 - (e_t * 134217729 - e_t));
      f_bh := (e_c * 134217729 - (e_c * 134217729 - e_c));
      f_e := (e_t - f_ah) * (e_c - f_bh) - (((f_p - f_ah * f_bh) - (e_t - f_ah) * f_bh) - f_ah * (e_c - f_bh));
      f_s := (6.61375632143793436117e-05)::float8 + f_p;
      f_tl := ((6.61375632143793436117e-05)::float8 - (f_s - (f_s - (6.61375632143793436117e-05)::float8))) + (f_p - (f_s - (6.61375632143793436117e-05)::float8));
      f_w := (f_tl - ((f_tl + f_e) - ((f_tl + f_e) - f_tl))) + (f_e - ((f_tl + f_e) - f_tl));
      e_c := f_s + (f_tl + f_e);
      if f_w <> 0 and ((f_s - (e_c - (e_c - f_s))) + ((f_tl + f_e) - (e_c - f_s))) <> 0 and (e_c + 2 * ((f_s - (e_c - (e_c - f_s))) + ((f_tl + f_e) - (e_c - f_s)))) - e_c = 2 * ((f_s - (e_c - (e_c - f_s))) + ((f_tl + f_e) - (e_c - f_s))) and (f_w < 0) = (((f_s - (e_c - (e_c - f_s))) + ((f_tl + f_e) - (e_c - f_s))) < 0) then e_c := e_c + 2 * ((f_s - (e_c - (e_c - f_s))) + ((f_tl + f_e) - (e_c - f_s))); end if;
    elsif e_t = 0 or e_c = 0 then
      e_c := e_t * e_c + (6.61375632143793436117e-05)::float8;
    else
      e_c := fdlibm_fma_wide(a => e_t, b => e_c, c => (6.61375632143793436117e-05)::float8);
    end if;
    if abs(e_t) >= 1e-144 and abs(e_t) <= 1e144 and abs(e_c) >= 1e-144 and abs(e_c) <= 1e144 and abs((-2.77777777770155933842e-03)::float8) <= 1e288 then
      f_p := e_t * e_c;
      f_ah := (e_t * 134217729 - (e_t * 134217729 - e_t));
      f_bh := (e_c * 134217729 - (e_c * 134217729 - e_c));
      f_e := (e_t - f_ah) * (e_c - f_bh) - (((f_p - f_ah * f_bh) - (e_t - f_ah) * f_bh) - f_ah * (e_c - f_bh));
      f_s := (-2.77777777770155933842e-03)::float8 + f_p;
      f_tl := ((-2.77777777770155933842e-03)::float8 - (f_s - (f_s - (-2.77777777770155933842e-03)::float8))) + (f_p - (f_s - (-2.77777777770155933842e-03)::float8));
      f_w := (f_tl - ((f_tl + f_e) - ((f_tl + f_e) - f_tl))) + (f_e - ((f_tl + f_e) - f_tl));
      e_c := f_s + (f_tl + f_e);
      if f_w <> 0 and ((f_s - (e_c - (e_c - f_s))) + ((f_tl + f_e) - (e_c - f_s))) <> 0 and (e_c + 2 * ((f_s - (e_c - (e_c - f_s))) + ((f_tl + f_e) - (e_c - f_s)))) - e_c = 2 * ((f_s - (e_c - (e_c - f_s))) + ((f_tl + f_e) - (e_c - f_s))) and (f_w < 0) = (((f_s - (e_c - (e_c - f_s))) + ((f_tl + f_e) - (e_c - f_s))) < 0) then e_c := e_c + 2 * ((f_s - (e_c - (e_c - f_s))) + ((f_tl + f_e) - (e_c - f_s))); end if;
    elsif e_t = 0 or e_c = 0 then
      e_c := e_t * e_c + (-2.77777777770155933842e-03)::float8;
    else
      e_c := fdlibm_fma_wide(a => e_t, b => e_c, c => (-2.77777777770155933842e-03)::float8);
    end if;
    if abs(e_t) >= 1e-144 and abs(e_t) <= 1e144 and abs(e_c) >= 1e-144 and abs(e_c) <= 1e144 and abs((1.66666666666666019037e-01)::float8) <= 1e288 then
      f_p := e_t * e_c;
      f_ah := (e_t * 134217729 - (e_t * 134217729 - e_t));
      f_bh := (e_c * 134217729 - (e_c * 134217729 - e_c));
      f_e := (e_t - f_ah) * (e_c - f_bh) - (((f_p - f_ah * f_bh) - (e_t - f_ah) * f_bh) - f_ah * (e_c - f_bh));
      f_s := (1.66666666666666019037e-01)::float8 + f_p;
      f_tl := ((1.66666666666666019037e-01)::float8 - (f_s - (f_s - (1.66666666666666019037e-01)::float8))) + (f_p - (f_s - (1.66666666666666019037e-01)::float8));
      f_w := (f_tl - ((f_tl + f_e) - ((f_tl + f_e) - f_tl))) + (f_e - ((f_tl + f_e) - f_tl));
      e_c := f_s + (f_tl + f_e);
      if f_w <> 0 and ((f_s - (e_c - (e_c - f_s))) + ((f_tl + f_e) - (e_c - f_s))) <> 0 and (e_c + 2 * ((f_s - (e_c - (e_c - f_s))) + ((f_tl + f_e) - (e_c - f_s)))) - e_c = 2 * ((f_s - (e_c - (e_c - f_s))) + ((f_tl + f_e) - (e_c - f_s))) and (f_w < 0) = (((f_s - (e_c - (e_c - f_s))) + ((f_tl + f_e) - (e_c - f_s))) < 0) then e_c := e_c + 2 * ((f_s - (e_c - (e_c - f_s))) + ((f_tl + f_e) - (e_c - f_s))); end if;
    elsif e_t = 0 or e_c = 0 then
      e_c := e_t * e_c + (1.66666666666666019037e-01)::float8;
    else
      e_c := fdlibm_fma_wide(a => e_t, b => e_c, c => (1.66666666666666019037e-01)::float8);
    end if;
    if abs(-e_t) >= 1e-144 and abs(-e_t) <= 1e144 and abs(e_c) >= 1e-144 and abs(e_c) <= 1e144 and abs(e_x) <= 1e288 then
      f_p := -e_t * e_c;
      f_ah := (-e_t * 134217729 - (-e_t * 134217729 - -e_t));
      f_bh := (e_c * 134217729 - (e_c * 134217729 - e_c));
      f_e := (-e_t - f_ah) * (e_c - f_bh) - (((f_p - f_ah * f_bh) - (-e_t - f_ah) * f_bh) - f_ah * (e_c - f_bh));
      f_s := e_x + f_p;
      f_tl := (e_x - (f_s - (f_s - e_x))) + (f_p - (f_s - e_x));
      f_w := (f_tl - ((f_tl + f_e) - ((f_tl + f_e) - f_tl))) + (f_e - ((f_tl + f_e) - f_tl));
      e_c := f_s + (f_tl + f_e);
      if f_w <> 0 and ((f_s - (e_c - (e_c - f_s))) + ((f_tl + f_e) - (e_c - f_s))) <> 0 and (e_c + 2 * ((f_s - (e_c - (e_c - f_s))) + ((f_tl + f_e) - (e_c - f_s)))) - e_c = 2 * ((f_s - (e_c - (e_c - f_s))) + ((f_tl + f_e) - (e_c - f_s))) and (f_w < 0) = (((f_s - (e_c - (e_c - f_s))) + ((f_tl + f_e) - (e_c - f_s))) < 0) then e_c := e_c + 2 * ((f_s - (e_c - (e_c - f_s))) + ((f_tl + f_e) - (e_c - f_s))); end if;
    elsif -e_t = 0 or e_c = 0 then
      e_c := -e_t * e_c + e_x;
    else
      e_c := fdlibm_fma_wide(a => -e_t, b => e_c, c => e_x);
    end if;
    if e_k = 0 then w := 1 - ((e_x * e_c) / (e_c - 2) - e_x); exit; end if;
    e_y := 1 - ((e_lo - (e_x * e_c) / (2 - e_c)) - e_hi);
    if e_k >= -1021 then
      if e_k = 1024 then w := case when e_y >= 1 then 'Infinity'::float8 else e_y * 2 * 8.988465674311579539e307 end; exit; end if;
      w := e_y * (('{2.2250738585072014e-308,4.1045368012983762e-289,7.571533991467358e-270,1.3967014978599092e-250,2.5764595078388533e-231,4.7527289157379e-212,8.767237396033612e-193,1.617269844780878e-173,2.983336292480083e-154,5.503284107318959e-135,1.0151767349262597e-115,1.8726705418768793e-96,3.454467422037778e-77,6.372367644529809e-58,1.1754943508222875e-38,2.168404344971009e-19,4,73786976294838210000,1.361129467683754e+39,2.5108406941546723e+58,4.631683569492648e+77,8.54394814368364e+96,1.5760802478557792e+116,2.9073548971824276e+135,5.363123171977039e+154,9.893216058924181e+173,1.824976247048878e+193,3.366486976990959e+212,6.210072369202836e+231,1.1455561567389984e+251,2.113178124542661e+270,3.89812560456e+289}'::float8[])[(((e_k) + 1022) >> 6) + 1] * ('{1,2,4,8,16,32,64,128,256,512,1024,2048,4096,8192,16384,32768,65536,131072,262144,524288,1048576,2097152,4194304,8388608,16777216,33554432,67108864,134217728,268435456,536870912,1073741824,2147483648,4294967296,8589934592,17179869184,34359738368,68719476736,137438953472,274877906944,549755813888,1099511627776,2199023255552,4398046511104,8796093022208,17592186044416,35184372088832,70368744177664,140737488355328,281474976710656,562949953421312,1125899906842624,2251799813685248,4503599627370496,9007199254740992,18014398509481984,36028797018963970,72057594037927940,144115188075855870,288230376151711740,576460752303423500,1152921504606847000,2305843009213694000,4611686018427388000,9223372036854776000}'::float8[])[(((e_k) + 1022) & 63) + 1]); exit;
    end if;
    e_y := e_y * (('{2.2250738585072014e-308,4.1045368012983762e-289,7.571533991467358e-270,1.3967014978599092e-250,2.5764595078388533e-231,4.7527289157379e-212,8.767237396033612e-193,1.617269844780878e-173,2.983336292480083e-154,5.503284107318959e-135,1.0151767349262597e-115,1.8726705418768793e-96,3.454467422037778e-77,6.372367644529809e-58,1.1754943508222875e-38,2.168404344971009e-19,4,73786976294838210000,1.361129467683754e+39,2.5108406941546723e+58,4.631683569492648e+77,8.54394814368364e+96,1.5760802478557792e+116,2.9073548971824276e+135,5.363123171977039e+154,9.893216058924181e+173,1.824976247048878e+193,3.366486976990959e+212,6.210072369202836e+231,1.1455561567389984e+251,2.113178124542661e+270,3.89812560456e+289}'::float8[])[(((e_k + 1000) + 1022) >> 6) + 1] * ('{1,2,4,8,16,32,64,128,256,512,1024,2048,4096,8192,16384,32768,65536,131072,262144,524288,1048576,2097152,4194304,8388608,16777216,33554432,67108864,134217728,268435456,536870912,1073741824,2147483648,4294967296,8589934592,17179869184,34359738368,68719476736,137438953472,274877906944,549755813888,1099511627776,2199023255552,4398046511104,8796093022208,17592186044416,35184372088832,70368744177664,140737488355328,281474976710656,562949953421312,1125899906842624,2251799813685248,4503599627370496,9007199254740992,18014398509481984,36028797018963970,72057594037927940,144115188075855870,288230376151711740,576460752303423500,1152921504606847000,2305843009213694000,4611686018427388000,9223372036854776000}'::float8[])[(((e_k + 1000) + 1022) & 63) + 1]);
    w := case when e_y <= 2.6469779601696886e-23 then 0 else e_y * 9.33263618503218878990e-302 end; exit;
  end loop;

    t := 0.5 * w;
    return t * w;
  end if;
  if ix >= 0x7FF00000 then return x * x; end if;
  return 'Infinity';
end $$;
-- V8's tanh (ieee754.cc; Math.tanh).
create function p3.fdlibm_tanh(x float8) returns float8 language plpgsql immutable as $$
declare f_a float8; f_b float8; f_c float8; f_p float8; f_ah float8; f_bh float8; f_e float8; f_s float8; f_tl float8; f_w float8; m_x float8; m_hx int; m_xsb boolean; m_k int; m_hi float8; m_lo float8; m_c float8; m_t float8; m_e float8; m_hxs float8; m_hfx float8; m_r1 float8; m_y float8; m_u float8;
 jx int := (int8(float8send(x)) >> 32)::int; ix int := jx & 2147483647; t float8; z float8;
begin
  if ix >= 0x7FF00000 then
    if jx >= 0 then return 1 / x + 1; end if;
    return 1 / x - 1;
  end if;
  if ix < 0x40360000 then
    if ix < 0x3E300000 then return x; end if;
    if ix >= 0x3FF00000 then
  loop
    m_x := 2 * abs(x);
    m_hx := (int8(float8send(m_x)) >> 32)::int;
    m_xsb := m_hx < 0;
    m_hx := m_hx & 2147483647;
    if m_hx >= 0x4043687A then
      if m_hx >= 0x40862E42 then
        if m_hx >= 0x7FF00000 then
          if (m_hx & 0xFFFFF) <> 0 or (int8(float8send(m_x)) & 4294967295) <> 0 then t := m_x; exit; end if;
          t := case when m_xsb then -1 else m_x end; exit;
        end if;
        if m_x > 7.09782712893383973096e+02 then t := 'Infinity'; exit; end if;
      end if;
      if m_xsb then t := -1; exit; end if;
    end if;
    if m_hx > 0x3FD62E42 then
      if m_hx < 0x3FF0A2B2 then
        if not m_xsb then
          m_hi := m_x - 6.93147180369123816490e-01; m_lo := 1.90821492927058770002e-10; m_k := 1;
        else
          m_hi := m_x + 6.93147180369123816490e-01; m_lo := -1.90821492927058770002e-10; m_k := -1;
        end if;
      else
        f_c := case when m_xsb then -0.5 else 0.5 end;
        if abs((1.44269504088896338700e+00)::float8) >= 1e-144 and abs((1.44269504088896338700e+00)::float8) <= 1e144 and abs(m_x) >= 1e-144 and abs(m_x) <= 1e144 and abs(f_c) <= 1e288 then
          f_p := (1.44269504088896338700e+00)::float8 * m_x;
          f_bh := (m_x * 134217729 - (m_x * 134217729 - m_x));
          f_e := ((1.44269504088896338700e+00)::float8 - ((1.44269504088896338700e+00)::float8 * 134217729 - ((1.44269504088896338700e+00)::float8 * 134217729 - (1.44269504088896338700e+00)::float8))) * (m_x - f_bh) - (((f_p - ((1.44269504088896338700e+00)::float8 * 134217729 - ((1.44269504088896338700e+00)::float8 * 134217729 - (1.44269504088896338700e+00)::float8)) * f_bh) - ((1.44269504088896338700e+00)::float8 - ((1.44269504088896338700e+00)::float8 * 134217729 - ((1.44269504088896338700e+00)::float8 * 134217729 - (1.44269504088896338700e+00)::float8))) * f_bh) - ((1.44269504088896338700e+00)::float8 * 134217729 - ((1.44269504088896338700e+00)::float8 * 134217729 - (1.44269504088896338700e+00)::float8)) * (m_x - f_bh));
          f_s := f_c + f_p;
          f_tl := (f_c - (f_s - (f_s - f_c))) + (f_p - (f_s - f_c));
          f_w := (f_tl - ((f_tl + f_e) - ((f_tl + f_e) - f_tl))) + (f_e - ((f_tl + f_e) - f_tl));
          m_u := f_s + (f_tl + f_e);
          if f_w <> 0 and ((f_s - (m_u - (m_u - f_s))) + ((f_tl + f_e) - (m_u - f_s))) <> 0 and (m_u + 2 * ((f_s - (m_u - (m_u - f_s))) + ((f_tl + f_e) - (m_u - f_s)))) - m_u = 2 * ((f_s - (m_u - (m_u - f_s))) + ((f_tl + f_e) - (m_u - f_s))) and (f_w < 0) = (((f_s - (m_u - (m_u - f_s))) + ((f_tl + f_e) - (m_u - f_s))) < 0) then m_u := m_u + 2 * ((f_s - (m_u - (m_u - f_s))) + ((f_tl + f_e) - (m_u - f_s))); end if;
        elsif (1.44269504088896338700e+00)::float8 = 0 or m_x = 0 then
          m_u := (1.44269504088896338700e+00)::float8 * m_x + f_c;
        else
          m_u := fdlibm_fma_wide(a => (1.44269504088896338700e+00)::float8, b => m_x, c => f_c);
        end if;
        m_k := trunc(m_u)::int;
        m_t := m_k;
        m_hi := m_x - m_t * 6.93147180369123816490e-01;
        m_lo := m_t * 1.90821492927058770002e-10;
      end if;
      m_x := m_hi - m_lo;
      m_c := (m_hi - m_x) - m_lo;
    elsif m_hx < 0x3C900000 then
      t := m_x; exit;
    else
      m_k := 0;
    end if;
    m_hfx := 0.5 * m_x;
    m_hxs := m_x * m_hfx;
    if abs(m_hxs) >= 1e-144 and abs(m_hxs) <= 1e144 and abs((-2.01099218183624371326e-07)::float8) >= 1e-144 and abs((-2.01099218183624371326e-07)::float8) <= 1e144 and abs((4.00821782732936239552e-06)::float8) <= 1e288 then
      f_p := m_hxs * (-2.01099218183624371326e-07)::float8;
      f_ah := (m_hxs * 134217729 - (m_hxs * 134217729 - m_hxs));
      f_e := (m_hxs - f_ah) * ((-2.01099218183624371326e-07)::float8 - ((-2.01099218183624371326e-07)::float8 * 134217729 - ((-2.01099218183624371326e-07)::float8 * 134217729 - (-2.01099218183624371326e-07)::float8))) - (((f_p - f_ah * ((-2.01099218183624371326e-07)::float8 * 134217729 - ((-2.01099218183624371326e-07)::float8 * 134217729 - (-2.01099218183624371326e-07)::float8))) - (m_hxs - f_ah) * ((-2.01099218183624371326e-07)::float8 * 134217729 - ((-2.01099218183624371326e-07)::float8 * 134217729 - (-2.01099218183624371326e-07)::float8))) - f_ah * ((-2.01099218183624371326e-07)::float8 - ((-2.01099218183624371326e-07)::float8 * 134217729 - ((-2.01099218183624371326e-07)::float8 * 134217729 - (-2.01099218183624371326e-07)::float8))));
      f_s := (4.00821782732936239552e-06)::float8 + f_p;
      f_tl := ((4.00821782732936239552e-06)::float8 - (f_s - (f_s - (4.00821782732936239552e-06)::float8))) + (f_p - (f_s - (4.00821782732936239552e-06)::float8));
      f_w := (f_tl - ((f_tl + f_e) - ((f_tl + f_e) - f_tl))) + (f_e - ((f_tl + f_e) - f_tl));
      m_r1 := f_s + (f_tl + f_e);
      if f_w <> 0 and ((f_s - (m_r1 - (m_r1 - f_s))) + ((f_tl + f_e) - (m_r1 - f_s))) <> 0 and (m_r1 + 2 * ((f_s - (m_r1 - (m_r1 - f_s))) + ((f_tl + f_e) - (m_r1 - f_s)))) - m_r1 = 2 * ((f_s - (m_r1 - (m_r1 - f_s))) + ((f_tl + f_e) - (m_r1 - f_s))) and (f_w < 0) = (((f_s - (m_r1 - (m_r1 - f_s))) + ((f_tl + f_e) - (m_r1 - f_s))) < 0) then m_r1 := m_r1 + 2 * ((f_s - (m_r1 - (m_r1 - f_s))) + ((f_tl + f_e) - (m_r1 - f_s))); end if;
    elsif m_hxs = 0 or (-2.01099218183624371326e-07)::float8 = 0 then
      m_r1 := m_hxs * (-2.01099218183624371326e-07)::float8 + (4.00821782732936239552e-06)::float8;
    else
      m_r1 := fdlibm_fma_wide(a => m_hxs, b => (-2.01099218183624371326e-07)::float8, c => (4.00821782732936239552e-06)::float8);
    end if;
    if abs(m_hxs) >= 1e-144 and abs(m_hxs) <= 1e144 and abs(m_r1) >= 1e-144 and abs(m_r1) <= 1e144 and abs((-7.93650757867487942473e-05)::float8) <= 1e288 then
      f_p := m_hxs * m_r1;
      f_ah := (m_hxs * 134217729 - (m_hxs * 134217729 - m_hxs));
      f_bh := (m_r1 * 134217729 - (m_r1 * 134217729 - m_r1));
      f_e := (m_hxs - f_ah) * (m_r1 - f_bh) - (((f_p - f_ah * f_bh) - (m_hxs - f_ah) * f_bh) - f_ah * (m_r1 - f_bh));
      f_s := (-7.93650757867487942473e-05)::float8 + f_p;
      f_tl := ((-7.93650757867487942473e-05)::float8 - (f_s - (f_s - (-7.93650757867487942473e-05)::float8))) + (f_p - (f_s - (-7.93650757867487942473e-05)::float8));
      f_w := (f_tl - ((f_tl + f_e) - ((f_tl + f_e) - f_tl))) + (f_e - ((f_tl + f_e) - f_tl));
      m_r1 := f_s + (f_tl + f_e);
      if f_w <> 0 and ((f_s - (m_r1 - (m_r1 - f_s))) + ((f_tl + f_e) - (m_r1 - f_s))) <> 0 and (m_r1 + 2 * ((f_s - (m_r1 - (m_r1 - f_s))) + ((f_tl + f_e) - (m_r1 - f_s)))) - m_r1 = 2 * ((f_s - (m_r1 - (m_r1 - f_s))) + ((f_tl + f_e) - (m_r1 - f_s))) and (f_w < 0) = (((f_s - (m_r1 - (m_r1 - f_s))) + ((f_tl + f_e) - (m_r1 - f_s))) < 0) then m_r1 := m_r1 + 2 * ((f_s - (m_r1 - (m_r1 - f_s))) + ((f_tl + f_e) - (m_r1 - f_s))); end if;
    elsif m_hxs = 0 or m_r1 = 0 then
      m_r1 := m_hxs * m_r1 + (-7.93650757867487942473e-05)::float8;
    else
      m_r1 := fdlibm_fma_wide(a => m_hxs, b => m_r1, c => (-7.93650757867487942473e-05)::float8);
    end if;
    if abs(m_hxs) >= 1e-144 and abs(m_hxs) <= 1e144 and abs(m_r1) >= 1e-144 and abs(m_r1) <= 1e144 and abs((1.58730158725481460165e-03)::float8) <= 1e288 then
      f_p := m_hxs * m_r1;
      f_ah := (m_hxs * 134217729 - (m_hxs * 134217729 - m_hxs));
      f_bh := (m_r1 * 134217729 - (m_r1 * 134217729 - m_r1));
      f_e := (m_hxs - f_ah) * (m_r1 - f_bh) - (((f_p - f_ah * f_bh) - (m_hxs - f_ah) * f_bh) - f_ah * (m_r1 - f_bh));
      f_s := (1.58730158725481460165e-03)::float8 + f_p;
      f_tl := ((1.58730158725481460165e-03)::float8 - (f_s - (f_s - (1.58730158725481460165e-03)::float8))) + (f_p - (f_s - (1.58730158725481460165e-03)::float8));
      f_w := (f_tl - ((f_tl + f_e) - ((f_tl + f_e) - f_tl))) + (f_e - ((f_tl + f_e) - f_tl));
      m_r1 := f_s + (f_tl + f_e);
      if f_w <> 0 and ((f_s - (m_r1 - (m_r1 - f_s))) + ((f_tl + f_e) - (m_r1 - f_s))) <> 0 and (m_r1 + 2 * ((f_s - (m_r1 - (m_r1 - f_s))) + ((f_tl + f_e) - (m_r1 - f_s)))) - m_r1 = 2 * ((f_s - (m_r1 - (m_r1 - f_s))) + ((f_tl + f_e) - (m_r1 - f_s))) and (f_w < 0) = (((f_s - (m_r1 - (m_r1 - f_s))) + ((f_tl + f_e) - (m_r1 - f_s))) < 0) then m_r1 := m_r1 + 2 * ((f_s - (m_r1 - (m_r1 - f_s))) + ((f_tl + f_e) - (m_r1 - f_s))); end if;
    elsif m_hxs = 0 or m_r1 = 0 then
      m_r1 := m_hxs * m_r1 + (1.58730158725481460165e-03)::float8;
    else
      m_r1 := fdlibm_fma_wide(a => m_hxs, b => m_r1, c => (1.58730158725481460165e-03)::float8);
    end if;
    if abs(m_hxs) >= 1e-144 and abs(m_hxs) <= 1e144 and abs(m_r1) >= 1e-144 and abs(m_r1) <= 1e144 and abs((-3.33333333333331316428e-02)::float8) <= 1e288 then
      f_p := m_hxs * m_r1;
      f_ah := (m_hxs * 134217729 - (m_hxs * 134217729 - m_hxs));
      f_bh := (m_r1 * 134217729 - (m_r1 * 134217729 - m_r1));
      f_e := (m_hxs - f_ah) * (m_r1 - f_bh) - (((f_p - f_ah * f_bh) - (m_hxs - f_ah) * f_bh) - f_ah * (m_r1 - f_bh));
      f_s := (-3.33333333333331316428e-02)::float8 + f_p;
      f_tl := ((-3.33333333333331316428e-02)::float8 - (f_s - (f_s - (-3.33333333333331316428e-02)::float8))) + (f_p - (f_s - (-3.33333333333331316428e-02)::float8));
      f_w := (f_tl - ((f_tl + f_e) - ((f_tl + f_e) - f_tl))) + (f_e - ((f_tl + f_e) - f_tl));
      m_r1 := f_s + (f_tl + f_e);
      if f_w <> 0 and ((f_s - (m_r1 - (m_r1 - f_s))) + ((f_tl + f_e) - (m_r1 - f_s))) <> 0 and (m_r1 + 2 * ((f_s - (m_r1 - (m_r1 - f_s))) + ((f_tl + f_e) - (m_r1 - f_s)))) - m_r1 = 2 * ((f_s - (m_r1 - (m_r1 - f_s))) + ((f_tl + f_e) - (m_r1 - f_s))) and (f_w < 0) = (((f_s - (m_r1 - (m_r1 - f_s))) + ((f_tl + f_e) - (m_r1 - f_s))) < 0) then m_r1 := m_r1 + 2 * ((f_s - (m_r1 - (m_r1 - f_s))) + ((f_tl + f_e) - (m_r1 - f_s))); end if;
    elsif m_hxs = 0 or m_r1 = 0 then
      m_r1 := m_hxs * m_r1 + (-3.33333333333331316428e-02)::float8;
    else
      m_r1 := fdlibm_fma_wide(a => m_hxs, b => m_r1, c => (-3.33333333333331316428e-02)::float8);
    end if;
    if abs(m_hxs) >= 1e-144 and abs(m_hxs) <= 1e144 and abs(m_r1) >= 1e-144 and abs(m_r1) <= 1e144 and abs((1)::float8) <= 1e288 then
      f_p := m_hxs * m_r1;
      f_ah := (m_hxs * 134217729 - (m_hxs * 134217729 - m_hxs));
      f_bh := (m_r1 * 134217729 - (m_r1 * 134217729 - m_r1));
      f_e := (m_hxs - f_ah) * (m_r1 - f_bh) - (((f_p - f_ah * f_bh) - (m_hxs - f_ah) * f_bh) - f_ah * (m_r1 - f_bh));
      f_s := (1)::float8 + f_p;
      f_tl := ((1)::float8 - (f_s - (f_s - (1)::float8))) + (f_p - (f_s - (1)::float8));
      f_w := (f_tl - ((f_tl + f_e) - ((f_tl + f_e) - f_tl))) + (f_e - ((f_tl + f_e) - f_tl));
      m_r1 := f_s + (f_tl + f_e);
      if f_w <> 0 and ((f_s - (m_r1 - (m_r1 - f_s))) + ((f_tl + f_e) - (m_r1 - f_s))) <> 0 and (m_r1 + 2 * ((f_s - (m_r1 - (m_r1 - f_s))) + ((f_tl + f_e) - (m_r1 - f_s)))) - m_r1 = 2 * ((f_s - (m_r1 - (m_r1 - f_s))) + ((f_tl + f_e) - (m_r1 - f_s))) and (f_w < 0) = (((f_s - (m_r1 - (m_r1 - f_s))) + ((f_tl + f_e) - (m_r1 - f_s))) < 0) then m_r1 := m_r1 + 2 * ((f_s - (m_r1 - (m_r1 - f_s))) + ((f_tl + f_e) - (m_r1 - f_s))); end if;
    elsif m_hxs = 0 or m_r1 = 0 then
      m_r1 := m_hxs * m_r1 + (1)::float8;
    else
      m_r1 := fdlibm_fma_wide(a => m_hxs, b => m_r1, c => (1)::float8);
    end if;
    if abs(-m_r1) >= 1e-144 and abs(-m_r1) <= 1e144 and abs(m_hfx) >= 1e-144 and abs(m_hfx) <= 1e144 and abs((3)::float8) <= 1e288 then
      f_p := -m_r1 * m_hfx;
      f_ah := (-m_r1 * 134217729 - (-m_r1 * 134217729 - -m_r1));
      f_bh := (m_hfx * 134217729 - (m_hfx * 134217729 - m_hfx));
      f_e := (-m_r1 - f_ah) * (m_hfx - f_bh) - (((f_p - f_ah * f_bh) - (-m_r1 - f_ah) * f_bh) - f_ah * (m_hfx - f_bh));
      f_s := (3)::float8 + f_p;
      f_tl := ((3)::float8 - (f_s - (f_s - (3)::float8))) + (f_p - (f_s - (3)::float8));
      f_w := (f_tl - ((f_tl + f_e) - ((f_tl + f_e) - f_tl))) + (f_e - ((f_tl + f_e) - f_tl));
      m_t := f_s + (f_tl + f_e);
      if f_w <> 0 and ((f_s - (m_t - (m_t - f_s))) + ((f_tl + f_e) - (m_t - f_s))) <> 0 and (m_t + 2 * ((f_s - (m_t - (m_t - f_s))) + ((f_tl + f_e) - (m_t - f_s)))) - m_t = 2 * ((f_s - (m_t - (m_t - f_s))) + ((f_tl + f_e) - (m_t - f_s))) and (f_w < 0) = (((f_s - (m_t - (m_t - f_s))) + ((f_tl + f_e) - (m_t - f_s))) < 0) then m_t := m_t + 2 * ((f_s - (m_t - (m_t - f_s))) + ((f_tl + f_e) - (m_t - f_s))); end if;
    elsif -m_r1 = 0 or m_hfx = 0 then
      m_t := -m_r1 * m_hfx + (3)::float8;
    else
      m_t := fdlibm_fma_wide(a => -m_r1, b => m_hfx, c => (3)::float8);
    end if;
    if abs(-m_x) >= 1e-144 and abs(-m_x) <= 1e144 and abs(m_t) >= 1e-144 and abs(m_t) <= 1e144 and abs((6)::float8) <= 1e288 then
      f_p := -m_x * m_t;
      f_ah := (-m_x * 134217729 - (-m_x * 134217729 - -m_x));
      f_bh := (m_t * 134217729 - (m_t * 134217729 - m_t));
      f_e := (-m_x - f_ah) * (m_t - f_bh) - (((f_p - f_ah * f_bh) - (-m_x - f_ah) * f_bh) - f_ah * (m_t - f_bh));
      f_s := (6)::float8 + f_p;
      f_tl := ((6)::float8 - (f_s - (f_s - (6)::float8))) + (f_p - (f_s - (6)::float8));
      f_w := (f_tl - ((f_tl + f_e) - ((f_tl + f_e) - f_tl))) + (f_e - ((f_tl + f_e) - f_tl));
      m_u := f_s + (f_tl + f_e);
      if f_w <> 0 and ((f_s - (m_u - (m_u - f_s))) + ((f_tl + f_e) - (m_u - f_s))) <> 0 and (m_u + 2 * ((f_s - (m_u - (m_u - f_s))) + ((f_tl + f_e) - (m_u - f_s)))) - m_u = 2 * ((f_s - (m_u - (m_u - f_s))) + ((f_tl + f_e) - (m_u - f_s))) and (f_w < 0) = (((f_s - (m_u - (m_u - f_s))) + ((f_tl + f_e) - (m_u - f_s))) < 0) then m_u := m_u + 2 * ((f_s - (m_u - (m_u - f_s))) + ((f_tl + f_e) - (m_u - f_s))); end if;
    elsif -m_x = 0 or m_t = 0 then
      m_u := -m_x * m_t + (6)::float8;
    else
      m_u := fdlibm_fma_wide(a => -m_x, b => m_t, c => (6)::float8);
    end if;
    m_e := m_hxs * ((m_r1 - m_t) / m_u);
    if m_k = 0 then
      if abs(m_x) >= 1e-144 and abs(m_x) <= 1e144 and abs(m_e) >= 1e-144 and abs(m_e) <= 1e144 and abs(-m_hxs) <= 1e288 then
        f_p := m_x * m_e;
        f_ah := (m_x * 134217729 - (m_x * 134217729 - m_x));
        f_bh := (m_e * 134217729 - (m_e * 134217729 - m_e));
        f_e := (m_x - f_ah) * (m_e - f_bh) - (((f_p - f_ah * f_bh) - (m_x - f_ah) * f_bh) - f_ah * (m_e - f_bh));
        f_s := -m_hxs + f_p;
        f_tl := (-m_hxs - (f_s - (f_s - -m_hxs))) + (f_p - (f_s - -m_hxs));
        f_w := (f_tl - ((f_tl + f_e) - ((f_tl + f_e) - f_tl))) + (f_e - ((f_tl + f_e) - f_tl));
        m_u := f_s + (f_tl + f_e);
        if f_w <> 0 and ((f_s - (m_u - (m_u - f_s))) + ((f_tl + f_e) - (m_u - f_s))) <> 0 and (m_u + 2 * ((f_s - (m_u - (m_u - f_s))) + ((f_tl + f_e) - (m_u - f_s)))) - m_u = 2 * ((f_s - (m_u - (m_u - f_s))) + ((f_tl + f_e) - (m_u - f_s))) and (f_w < 0) = (((f_s - (m_u - (m_u - f_s))) + ((f_tl + f_e) - (m_u - f_s))) < 0) then m_u := m_u + 2 * ((f_s - (m_u - (m_u - f_s))) + ((f_tl + f_e) - (m_u - f_s))); end if;
      elsif m_x = 0 or m_e = 0 then
        m_u := m_x * m_e + -m_hxs;
      else
        m_u := fdlibm_fma_wide(a => m_x, b => m_e, c => -m_hxs);
      end if;
      t := m_x - m_u; exit;
    end if;
    f_b := m_e - m_c;
    if abs(m_x) >= 1e-144 and abs(m_x) <= 1e144 and abs(f_b) >= 1e-144 and abs(f_b) <= 1e144 and abs(-m_c) <= 1e288 then
      f_p := m_x * f_b;
      f_ah := (m_x * 134217729 - (m_x * 134217729 - m_x));
      f_bh := (f_b * 134217729 - (f_b * 134217729 - f_b));
      f_e := (m_x - f_ah) * (f_b - f_bh) - (((f_p - f_ah * f_bh) - (m_x - f_ah) * f_bh) - f_ah * (f_b - f_bh));
      f_s := -m_c + f_p;
      f_tl := (-m_c - (f_s - (f_s - -m_c))) + (f_p - (f_s - -m_c));
      f_w := (f_tl - ((f_tl + f_e) - ((f_tl + f_e) - f_tl))) + (f_e - ((f_tl + f_e) - f_tl));
      m_e := f_s + (f_tl + f_e);
      if f_w <> 0 and ((f_s - (m_e - (m_e - f_s))) + ((f_tl + f_e) - (m_e - f_s))) <> 0 and (m_e + 2 * ((f_s - (m_e - (m_e - f_s))) + ((f_tl + f_e) - (m_e - f_s)))) - m_e = 2 * ((f_s - (m_e - (m_e - f_s))) + ((f_tl + f_e) - (m_e - f_s))) and (f_w < 0) = (((f_s - (m_e - (m_e - f_s))) + ((f_tl + f_e) - (m_e - f_s))) < 0) then m_e := m_e + 2 * ((f_s - (m_e - (m_e - f_s))) + ((f_tl + f_e) - (m_e - f_s))); end if;
    elsif m_x = 0 or f_b = 0 then
      m_e := m_x * f_b + -m_c;
    else
      m_e := fdlibm_fma_wide(a => m_x, b => f_b, c => -m_c);
    end if;
    m_e := m_e - m_hxs;
    if m_k = -1 then t := 0.5 * (m_x - m_e) - 0.5; exit; end if;
    if m_k = 1 then
      if m_x < -0.25 then t := -2 * (m_e - (m_x + 0.5)); exit; end if;
      t := 1 + 2 * (m_x - m_e); exit;
    end if;
    if m_k <= -2 or m_k > 56 then
      m_y := 1 - (m_e - m_x);
      if m_k = 1024 then
        if m_y >= 1 then t := 'Infinity'; exit; end if;
        m_y := m_y * 2 * 8.98846567431158e+307;
      else
        m_y := m_y * (('{2.2250738585072014e-308,4.1045368012983762e-289,7.571533991467358e-270,1.3967014978599092e-250,2.5764595078388533e-231,4.7527289157379e-212,8.767237396033612e-193,1.617269844780878e-173,2.983336292480083e-154,5.503284107318959e-135,1.0151767349262597e-115,1.8726705418768793e-96,3.454467422037778e-77,6.372367644529809e-58,1.1754943508222875e-38,2.168404344971009e-19,4,73786976294838210000,1.361129467683754e+39,2.5108406941546723e+58,4.631683569492648e+77,8.54394814368364e+96,1.5760802478557792e+116,2.9073548971824276e+135,5.363123171977039e+154,9.893216058924181e+173,1.824976247048878e+193,3.366486976990959e+212,6.210072369202836e+231,1.1455561567389984e+251,2.113178124542661e+270,3.89812560456e+289}'::float8[])[(((m_k) + 1022) >> 6) + 1] * ('{1,2,4,8,16,32,64,128,256,512,1024,2048,4096,8192,16384,32768,65536,131072,262144,524288,1048576,2097152,4194304,8388608,16777216,33554432,67108864,134217728,268435456,536870912,1073741824,2147483648,4294967296,8589934592,17179869184,34359738368,68719476736,137438953472,274877906944,549755813888,1099511627776,2199023255552,4398046511104,8796093022208,17592186044416,35184372088832,70368744177664,140737488355328,281474976710656,562949953421312,1125899906842624,2251799813685248,4503599627370496,9007199254740992,18014398509481984,36028797018963970,72057594037927940,144115188075855870,288230376151711740,576460752303423500,1152921504606847000,2305843009213694000,4611686018427388000,9223372036854776000}'::float8[])[(((m_k) + 1022) & 63) + 1]);
      end if;
      t := m_y - 1; exit;
    end if;
    if m_k < 20 then
      m_y := (1 - (('{2.2250738585072014e-308,4.1045368012983762e-289,7.571533991467358e-270,1.3967014978599092e-250,2.5764595078388533e-231,4.7527289157379e-212,8.767237396033612e-193,1.617269844780878e-173,2.983336292480083e-154,5.503284107318959e-135,1.0151767349262597e-115,1.8726705418768793e-96,3.454467422037778e-77,6.372367644529809e-58,1.1754943508222875e-38,2.168404344971009e-19,4,73786976294838210000,1.361129467683754e+39,2.5108406941546723e+58,4.631683569492648e+77,8.54394814368364e+96,1.5760802478557792e+116,2.9073548971824276e+135,5.363123171977039e+154,9.893216058924181e+173,1.824976247048878e+193,3.366486976990959e+212,6.210072369202836e+231,1.1455561567389984e+251,2.113178124542661e+270,3.89812560456e+289}'::float8[])[(((-m_k) + 1022) >> 6) + 1] * ('{1,2,4,8,16,32,64,128,256,512,1024,2048,4096,8192,16384,32768,65536,131072,262144,524288,1048576,2097152,4194304,8388608,16777216,33554432,67108864,134217728,268435456,536870912,1073741824,2147483648,4294967296,8589934592,17179869184,34359738368,68719476736,137438953472,274877906944,549755813888,1099511627776,2199023255552,4398046511104,8796093022208,17592186044416,35184372088832,70368744177664,140737488355328,281474976710656,562949953421312,1125899906842624,2251799813685248,4503599627370496,9007199254740992,18014398509481984,36028797018963970,72057594037927940,144115188075855870,288230376151711740,576460752303423500,1152921504606847000,2305843009213694000,4611686018427388000,9223372036854776000}'::float8[])[(((-m_k) + 1022) & 63) + 1])) - (m_e - m_x);
    else
      m_y := (m_x - (m_e + (('{2.2250738585072014e-308,4.1045368012983762e-289,7.571533991467358e-270,1.3967014978599092e-250,2.5764595078388533e-231,4.7527289157379e-212,8.767237396033612e-193,1.617269844780878e-173,2.983336292480083e-154,5.503284107318959e-135,1.0151767349262597e-115,1.8726705418768793e-96,3.454467422037778e-77,6.372367644529809e-58,1.1754943508222875e-38,2.168404344971009e-19,4,73786976294838210000,1.361129467683754e+39,2.5108406941546723e+58,4.631683569492648e+77,8.54394814368364e+96,1.5760802478557792e+116,2.9073548971824276e+135,5.363123171977039e+154,9.893216058924181e+173,1.824976247048878e+193,3.366486976990959e+212,6.210072369202836e+231,1.1455561567389984e+251,2.113178124542661e+270,3.89812560456e+289}'::float8[])[(((-m_k) + 1022) >> 6) + 1] * ('{1,2,4,8,16,32,64,128,256,512,1024,2048,4096,8192,16384,32768,65536,131072,262144,524288,1048576,2097152,4194304,8388608,16777216,33554432,67108864,134217728,268435456,536870912,1073741824,2147483648,4294967296,8589934592,17179869184,34359738368,68719476736,137438953472,274877906944,549755813888,1099511627776,2199023255552,4398046511104,8796093022208,17592186044416,35184372088832,70368744177664,140737488355328,281474976710656,562949953421312,1125899906842624,2251799813685248,4503599627370496,9007199254740992,18014398509481984,36028797018963970,72057594037927940,144115188075855870,288230376151711740,576460752303423500,1152921504606847000,2305843009213694000,4611686018427388000,9223372036854776000}'::float8[])[(((-m_k) + 1022) & 63) + 1]))) + 1;
    end if;
    t := m_y * (('{2.2250738585072014e-308,4.1045368012983762e-289,7.571533991467358e-270,1.3967014978599092e-250,2.5764595078388533e-231,4.7527289157379e-212,8.767237396033612e-193,1.617269844780878e-173,2.983336292480083e-154,5.503284107318959e-135,1.0151767349262597e-115,1.8726705418768793e-96,3.454467422037778e-77,6.372367644529809e-58,1.1754943508222875e-38,2.168404344971009e-19,4,73786976294838210000,1.361129467683754e+39,2.5108406941546723e+58,4.631683569492648e+77,8.54394814368364e+96,1.5760802478557792e+116,2.9073548971824276e+135,5.363123171977039e+154,9.893216058924181e+173,1.824976247048878e+193,3.366486976990959e+212,6.210072369202836e+231,1.1455561567389984e+251,2.113178124542661e+270,3.89812560456e+289}'::float8[])[(((m_k) + 1022) >> 6) + 1] * ('{1,2,4,8,16,32,64,128,256,512,1024,2048,4096,8192,16384,32768,65536,131072,262144,524288,1048576,2097152,4194304,8388608,16777216,33554432,67108864,134217728,268435456,536870912,1073741824,2147483648,4294967296,8589934592,17179869184,34359738368,68719476736,137438953472,274877906944,549755813888,1099511627776,2199023255552,4398046511104,8796093022208,17592186044416,35184372088832,70368744177664,140737488355328,281474976710656,562949953421312,1125899906842624,2251799813685248,4503599627370496,9007199254740992,18014398509481984,36028797018963970,72057594037927940,144115188075855870,288230376151711740,576460752303423500,1152921504606847000,2305843009213694000,4611686018427388000,9223372036854776000}'::float8[])[(((m_k) + 1022) & 63) + 1]); exit;
  end loop;

      z := 1 - 2 / (t + 2);
    else
  loop
    m_x := -2 * abs(x);
    m_hx := (int8(float8send(m_x)) >> 32)::int;
    m_xsb := m_hx < 0;
    m_hx := m_hx & 2147483647;
    if m_hx >= 0x4043687A then
      if m_hx >= 0x40862E42 then
        if m_hx >= 0x7FF00000 then
          if (m_hx & 0xFFFFF) <> 0 or (int8(float8send(m_x)) & 4294967295) <> 0 then t := m_x; exit; end if;
          t := case when m_xsb then -1 else m_x end; exit;
        end if;
        if m_x > 7.09782712893383973096e+02 then t := 'Infinity'; exit; end if;
      end if;
      if m_xsb then t := -1; exit; end if;
    end if;
    if m_hx > 0x3FD62E42 then
      if m_hx < 0x3FF0A2B2 then
        if not m_xsb then
          m_hi := m_x - 6.93147180369123816490e-01; m_lo := 1.90821492927058770002e-10; m_k := 1;
        else
          m_hi := m_x + 6.93147180369123816490e-01; m_lo := -1.90821492927058770002e-10; m_k := -1;
        end if;
      else
        f_c := case when m_xsb then -0.5 else 0.5 end;
        if abs((1.44269504088896338700e+00)::float8) >= 1e-144 and abs((1.44269504088896338700e+00)::float8) <= 1e144 and abs(m_x) >= 1e-144 and abs(m_x) <= 1e144 and abs(f_c) <= 1e288 then
          f_p := (1.44269504088896338700e+00)::float8 * m_x;
          f_bh := (m_x * 134217729 - (m_x * 134217729 - m_x));
          f_e := ((1.44269504088896338700e+00)::float8 - ((1.44269504088896338700e+00)::float8 * 134217729 - ((1.44269504088896338700e+00)::float8 * 134217729 - (1.44269504088896338700e+00)::float8))) * (m_x - f_bh) - (((f_p - ((1.44269504088896338700e+00)::float8 * 134217729 - ((1.44269504088896338700e+00)::float8 * 134217729 - (1.44269504088896338700e+00)::float8)) * f_bh) - ((1.44269504088896338700e+00)::float8 - ((1.44269504088896338700e+00)::float8 * 134217729 - ((1.44269504088896338700e+00)::float8 * 134217729 - (1.44269504088896338700e+00)::float8))) * f_bh) - ((1.44269504088896338700e+00)::float8 * 134217729 - ((1.44269504088896338700e+00)::float8 * 134217729 - (1.44269504088896338700e+00)::float8)) * (m_x - f_bh));
          f_s := f_c + f_p;
          f_tl := (f_c - (f_s - (f_s - f_c))) + (f_p - (f_s - f_c));
          f_w := (f_tl - ((f_tl + f_e) - ((f_tl + f_e) - f_tl))) + (f_e - ((f_tl + f_e) - f_tl));
          m_u := f_s + (f_tl + f_e);
          if f_w <> 0 and ((f_s - (m_u - (m_u - f_s))) + ((f_tl + f_e) - (m_u - f_s))) <> 0 and (m_u + 2 * ((f_s - (m_u - (m_u - f_s))) + ((f_tl + f_e) - (m_u - f_s)))) - m_u = 2 * ((f_s - (m_u - (m_u - f_s))) + ((f_tl + f_e) - (m_u - f_s))) and (f_w < 0) = (((f_s - (m_u - (m_u - f_s))) + ((f_tl + f_e) - (m_u - f_s))) < 0) then m_u := m_u + 2 * ((f_s - (m_u - (m_u - f_s))) + ((f_tl + f_e) - (m_u - f_s))); end if;
        elsif (1.44269504088896338700e+00)::float8 = 0 or m_x = 0 then
          m_u := (1.44269504088896338700e+00)::float8 * m_x + f_c;
        else
          m_u := fdlibm_fma_wide(a => (1.44269504088896338700e+00)::float8, b => m_x, c => f_c);
        end if;
        m_k := trunc(m_u)::int;
        m_t := m_k;
        m_hi := m_x - m_t * 6.93147180369123816490e-01;
        m_lo := m_t * 1.90821492927058770002e-10;
      end if;
      m_x := m_hi - m_lo;
      m_c := (m_hi - m_x) - m_lo;
    elsif m_hx < 0x3C900000 then
      t := m_x; exit;
    else
      m_k := 0;
    end if;
    m_hfx := 0.5 * m_x;
    m_hxs := m_x * m_hfx;
    if abs(m_hxs) >= 1e-144 and abs(m_hxs) <= 1e144 and abs((-2.01099218183624371326e-07)::float8) >= 1e-144 and abs((-2.01099218183624371326e-07)::float8) <= 1e144 and abs((4.00821782732936239552e-06)::float8) <= 1e288 then
      f_p := m_hxs * (-2.01099218183624371326e-07)::float8;
      f_ah := (m_hxs * 134217729 - (m_hxs * 134217729 - m_hxs));
      f_e := (m_hxs - f_ah) * ((-2.01099218183624371326e-07)::float8 - ((-2.01099218183624371326e-07)::float8 * 134217729 - ((-2.01099218183624371326e-07)::float8 * 134217729 - (-2.01099218183624371326e-07)::float8))) - (((f_p - f_ah * ((-2.01099218183624371326e-07)::float8 * 134217729 - ((-2.01099218183624371326e-07)::float8 * 134217729 - (-2.01099218183624371326e-07)::float8))) - (m_hxs - f_ah) * ((-2.01099218183624371326e-07)::float8 * 134217729 - ((-2.01099218183624371326e-07)::float8 * 134217729 - (-2.01099218183624371326e-07)::float8))) - f_ah * ((-2.01099218183624371326e-07)::float8 - ((-2.01099218183624371326e-07)::float8 * 134217729 - ((-2.01099218183624371326e-07)::float8 * 134217729 - (-2.01099218183624371326e-07)::float8))));
      f_s := (4.00821782732936239552e-06)::float8 + f_p;
      f_tl := ((4.00821782732936239552e-06)::float8 - (f_s - (f_s - (4.00821782732936239552e-06)::float8))) + (f_p - (f_s - (4.00821782732936239552e-06)::float8));
      f_w := (f_tl - ((f_tl + f_e) - ((f_tl + f_e) - f_tl))) + (f_e - ((f_tl + f_e) - f_tl));
      m_r1 := f_s + (f_tl + f_e);
      if f_w <> 0 and ((f_s - (m_r1 - (m_r1 - f_s))) + ((f_tl + f_e) - (m_r1 - f_s))) <> 0 and (m_r1 + 2 * ((f_s - (m_r1 - (m_r1 - f_s))) + ((f_tl + f_e) - (m_r1 - f_s)))) - m_r1 = 2 * ((f_s - (m_r1 - (m_r1 - f_s))) + ((f_tl + f_e) - (m_r1 - f_s))) and (f_w < 0) = (((f_s - (m_r1 - (m_r1 - f_s))) + ((f_tl + f_e) - (m_r1 - f_s))) < 0) then m_r1 := m_r1 + 2 * ((f_s - (m_r1 - (m_r1 - f_s))) + ((f_tl + f_e) - (m_r1 - f_s))); end if;
    elsif m_hxs = 0 or (-2.01099218183624371326e-07)::float8 = 0 then
      m_r1 := m_hxs * (-2.01099218183624371326e-07)::float8 + (4.00821782732936239552e-06)::float8;
    else
      m_r1 := fdlibm_fma_wide(a => m_hxs, b => (-2.01099218183624371326e-07)::float8, c => (4.00821782732936239552e-06)::float8);
    end if;
    if abs(m_hxs) >= 1e-144 and abs(m_hxs) <= 1e144 and abs(m_r1) >= 1e-144 and abs(m_r1) <= 1e144 and abs((-7.93650757867487942473e-05)::float8) <= 1e288 then
      f_p := m_hxs * m_r1;
      f_ah := (m_hxs * 134217729 - (m_hxs * 134217729 - m_hxs));
      f_bh := (m_r1 * 134217729 - (m_r1 * 134217729 - m_r1));
      f_e := (m_hxs - f_ah) * (m_r1 - f_bh) - (((f_p - f_ah * f_bh) - (m_hxs - f_ah) * f_bh) - f_ah * (m_r1 - f_bh));
      f_s := (-7.93650757867487942473e-05)::float8 + f_p;
      f_tl := ((-7.93650757867487942473e-05)::float8 - (f_s - (f_s - (-7.93650757867487942473e-05)::float8))) + (f_p - (f_s - (-7.93650757867487942473e-05)::float8));
      f_w := (f_tl - ((f_tl + f_e) - ((f_tl + f_e) - f_tl))) + (f_e - ((f_tl + f_e) - f_tl));
      m_r1 := f_s + (f_tl + f_e);
      if f_w <> 0 and ((f_s - (m_r1 - (m_r1 - f_s))) + ((f_tl + f_e) - (m_r1 - f_s))) <> 0 and (m_r1 + 2 * ((f_s - (m_r1 - (m_r1 - f_s))) + ((f_tl + f_e) - (m_r1 - f_s)))) - m_r1 = 2 * ((f_s - (m_r1 - (m_r1 - f_s))) + ((f_tl + f_e) - (m_r1 - f_s))) and (f_w < 0) = (((f_s - (m_r1 - (m_r1 - f_s))) + ((f_tl + f_e) - (m_r1 - f_s))) < 0) then m_r1 := m_r1 + 2 * ((f_s - (m_r1 - (m_r1 - f_s))) + ((f_tl + f_e) - (m_r1 - f_s))); end if;
    elsif m_hxs = 0 or m_r1 = 0 then
      m_r1 := m_hxs * m_r1 + (-7.93650757867487942473e-05)::float8;
    else
      m_r1 := fdlibm_fma_wide(a => m_hxs, b => m_r1, c => (-7.93650757867487942473e-05)::float8);
    end if;
    if abs(m_hxs) >= 1e-144 and abs(m_hxs) <= 1e144 and abs(m_r1) >= 1e-144 and abs(m_r1) <= 1e144 and abs((1.58730158725481460165e-03)::float8) <= 1e288 then
      f_p := m_hxs * m_r1;
      f_ah := (m_hxs * 134217729 - (m_hxs * 134217729 - m_hxs));
      f_bh := (m_r1 * 134217729 - (m_r1 * 134217729 - m_r1));
      f_e := (m_hxs - f_ah) * (m_r1 - f_bh) - (((f_p - f_ah * f_bh) - (m_hxs - f_ah) * f_bh) - f_ah * (m_r1 - f_bh));
      f_s := (1.58730158725481460165e-03)::float8 + f_p;
      f_tl := ((1.58730158725481460165e-03)::float8 - (f_s - (f_s - (1.58730158725481460165e-03)::float8))) + (f_p - (f_s - (1.58730158725481460165e-03)::float8));
      f_w := (f_tl - ((f_tl + f_e) - ((f_tl + f_e) - f_tl))) + (f_e - ((f_tl + f_e) - f_tl));
      m_r1 := f_s + (f_tl + f_e);
      if f_w <> 0 and ((f_s - (m_r1 - (m_r1 - f_s))) + ((f_tl + f_e) - (m_r1 - f_s))) <> 0 and (m_r1 + 2 * ((f_s - (m_r1 - (m_r1 - f_s))) + ((f_tl + f_e) - (m_r1 - f_s)))) - m_r1 = 2 * ((f_s - (m_r1 - (m_r1 - f_s))) + ((f_tl + f_e) - (m_r1 - f_s))) and (f_w < 0) = (((f_s - (m_r1 - (m_r1 - f_s))) + ((f_tl + f_e) - (m_r1 - f_s))) < 0) then m_r1 := m_r1 + 2 * ((f_s - (m_r1 - (m_r1 - f_s))) + ((f_tl + f_e) - (m_r1 - f_s))); end if;
    elsif m_hxs = 0 or m_r1 = 0 then
      m_r1 := m_hxs * m_r1 + (1.58730158725481460165e-03)::float8;
    else
      m_r1 := fdlibm_fma_wide(a => m_hxs, b => m_r1, c => (1.58730158725481460165e-03)::float8);
    end if;
    if abs(m_hxs) >= 1e-144 and abs(m_hxs) <= 1e144 and abs(m_r1) >= 1e-144 and abs(m_r1) <= 1e144 and abs((-3.33333333333331316428e-02)::float8) <= 1e288 then
      f_p := m_hxs * m_r1;
      f_ah := (m_hxs * 134217729 - (m_hxs * 134217729 - m_hxs));
      f_bh := (m_r1 * 134217729 - (m_r1 * 134217729 - m_r1));
      f_e := (m_hxs - f_ah) * (m_r1 - f_bh) - (((f_p - f_ah * f_bh) - (m_hxs - f_ah) * f_bh) - f_ah * (m_r1 - f_bh));
      f_s := (-3.33333333333331316428e-02)::float8 + f_p;
      f_tl := ((-3.33333333333331316428e-02)::float8 - (f_s - (f_s - (-3.33333333333331316428e-02)::float8))) + (f_p - (f_s - (-3.33333333333331316428e-02)::float8));
      f_w := (f_tl - ((f_tl + f_e) - ((f_tl + f_e) - f_tl))) + (f_e - ((f_tl + f_e) - f_tl));
      m_r1 := f_s + (f_tl + f_e);
      if f_w <> 0 and ((f_s - (m_r1 - (m_r1 - f_s))) + ((f_tl + f_e) - (m_r1 - f_s))) <> 0 and (m_r1 + 2 * ((f_s - (m_r1 - (m_r1 - f_s))) + ((f_tl + f_e) - (m_r1 - f_s)))) - m_r1 = 2 * ((f_s - (m_r1 - (m_r1 - f_s))) + ((f_tl + f_e) - (m_r1 - f_s))) and (f_w < 0) = (((f_s - (m_r1 - (m_r1 - f_s))) + ((f_tl + f_e) - (m_r1 - f_s))) < 0) then m_r1 := m_r1 + 2 * ((f_s - (m_r1 - (m_r1 - f_s))) + ((f_tl + f_e) - (m_r1 - f_s))); end if;
    elsif m_hxs = 0 or m_r1 = 0 then
      m_r1 := m_hxs * m_r1 + (-3.33333333333331316428e-02)::float8;
    else
      m_r1 := fdlibm_fma_wide(a => m_hxs, b => m_r1, c => (-3.33333333333331316428e-02)::float8);
    end if;
    if abs(m_hxs) >= 1e-144 and abs(m_hxs) <= 1e144 and abs(m_r1) >= 1e-144 and abs(m_r1) <= 1e144 and abs((1)::float8) <= 1e288 then
      f_p := m_hxs * m_r1;
      f_ah := (m_hxs * 134217729 - (m_hxs * 134217729 - m_hxs));
      f_bh := (m_r1 * 134217729 - (m_r1 * 134217729 - m_r1));
      f_e := (m_hxs - f_ah) * (m_r1 - f_bh) - (((f_p - f_ah * f_bh) - (m_hxs - f_ah) * f_bh) - f_ah * (m_r1 - f_bh));
      f_s := (1)::float8 + f_p;
      f_tl := ((1)::float8 - (f_s - (f_s - (1)::float8))) + (f_p - (f_s - (1)::float8));
      f_w := (f_tl - ((f_tl + f_e) - ((f_tl + f_e) - f_tl))) + (f_e - ((f_tl + f_e) - f_tl));
      m_r1 := f_s + (f_tl + f_e);
      if f_w <> 0 and ((f_s - (m_r1 - (m_r1 - f_s))) + ((f_tl + f_e) - (m_r1 - f_s))) <> 0 and (m_r1 + 2 * ((f_s - (m_r1 - (m_r1 - f_s))) + ((f_tl + f_e) - (m_r1 - f_s)))) - m_r1 = 2 * ((f_s - (m_r1 - (m_r1 - f_s))) + ((f_tl + f_e) - (m_r1 - f_s))) and (f_w < 0) = (((f_s - (m_r1 - (m_r1 - f_s))) + ((f_tl + f_e) - (m_r1 - f_s))) < 0) then m_r1 := m_r1 + 2 * ((f_s - (m_r1 - (m_r1 - f_s))) + ((f_tl + f_e) - (m_r1 - f_s))); end if;
    elsif m_hxs = 0 or m_r1 = 0 then
      m_r1 := m_hxs * m_r1 + (1)::float8;
    else
      m_r1 := fdlibm_fma_wide(a => m_hxs, b => m_r1, c => (1)::float8);
    end if;
    if abs(-m_r1) >= 1e-144 and abs(-m_r1) <= 1e144 and abs(m_hfx) >= 1e-144 and abs(m_hfx) <= 1e144 and abs((3)::float8) <= 1e288 then
      f_p := -m_r1 * m_hfx;
      f_ah := (-m_r1 * 134217729 - (-m_r1 * 134217729 - -m_r1));
      f_bh := (m_hfx * 134217729 - (m_hfx * 134217729 - m_hfx));
      f_e := (-m_r1 - f_ah) * (m_hfx - f_bh) - (((f_p - f_ah * f_bh) - (-m_r1 - f_ah) * f_bh) - f_ah * (m_hfx - f_bh));
      f_s := (3)::float8 + f_p;
      f_tl := ((3)::float8 - (f_s - (f_s - (3)::float8))) + (f_p - (f_s - (3)::float8));
      f_w := (f_tl - ((f_tl + f_e) - ((f_tl + f_e) - f_tl))) + (f_e - ((f_tl + f_e) - f_tl));
      m_t := f_s + (f_tl + f_e);
      if f_w <> 0 and ((f_s - (m_t - (m_t - f_s))) + ((f_tl + f_e) - (m_t - f_s))) <> 0 and (m_t + 2 * ((f_s - (m_t - (m_t - f_s))) + ((f_tl + f_e) - (m_t - f_s)))) - m_t = 2 * ((f_s - (m_t - (m_t - f_s))) + ((f_tl + f_e) - (m_t - f_s))) and (f_w < 0) = (((f_s - (m_t - (m_t - f_s))) + ((f_tl + f_e) - (m_t - f_s))) < 0) then m_t := m_t + 2 * ((f_s - (m_t - (m_t - f_s))) + ((f_tl + f_e) - (m_t - f_s))); end if;
    elsif -m_r1 = 0 or m_hfx = 0 then
      m_t := -m_r1 * m_hfx + (3)::float8;
    else
      m_t := fdlibm_fma_wide(a => -m_r1, b => m_hfx, c => (3)::float8);
    end if;
    if abs(-m_x) >= 1e-144 and abs(-m_x) <= 1e144 and abs(m_t) >= 1e-144 and abs(m_t) <= 1e144 and abs((6)::float8) <= 1e288 then
      f_p := -m_x * m_t;
      f_ah := (-m_x * 134217729 - (-m_x * 134217729 - -m_x));
      f_bh := (m_t * 134217729 - (m_t * 134217729 - m_t));
      f_e := (-m_x - f_ah) * (m_t - f_bh) - (((f_p - f_ah * f_bh) - (-m_x - f_ah) * f_bh) - f_ah * (m_t - f_bh));
      f_s := (6)::float8 + f_p;
      f_tl := ((6)::float8 - (f_s - (f_s - (6)::float8))) + (f_p - (f_s - (6)::float8));
      f_w := (f_tl - ((f_tl + f_e) - ((f_tl + f_e) - f_tl))) + (f_e - ((f_tl + f_e) - f_tl));
      m_u := f_s + (f_tl + f_e);
      if f_w <> 0 and ((f_s - (m_u - (m_u - f_s))) + ((f_tl + f_e) - (m_u - f_s))) <> 0 and (m_u + 2 * ((f_s - (m_u - (m_u - f_s))) + ((f_tl + f_e) - (m_u - f_s)))) - m_u = 2 * ((f_s - (m_u - (m_u - f_s))) + ((f_tl + f_e) - (m_u - f_s))) and (f_w < 0) = (((f_s - (m_u - (m_u - f_s))) + ((f_tl + f_e) - (m_u - f_s))) < 0) then m_u := m_u + 2 * ((f_s - (m_u - (m_u - f_s))) + ((f_tl + f_e) - (m_u - f_s))); end if;
    elsif -m_x = 0 or m_t = 0 then
      m_u := -m_x * m_t + (6)::float8;
    else
      m_u := fdlibm_fma_wide(a => -m_x, b => m_t, c => (6)::float8);
    end if;
    m_e := m_hxs * ((m_r1 - m_t) / m_u);
    if m_k = 0 then
      if abs(m_x) >= 1e-144 and abs(m_x) <= 1e144 and abs(m_e) >= 1e-144 and abs(m_e) <= 1e144 and abs(-m_hxs) <= 1e288 then
        f_p := m_x * m_e;
        f_ah := (m_x * 134217729 - (m_x * 134217729 - m_x));
        f_bh := (m_e * 134217729 - (m_e * 134217729 - m_e));
        f_e := (m_x - f_ah) * (m_e - f_bh) - (((f_p - f_ah * f_bh) - (m_x - f_ah) * f_bh) - f_ah * (m_e - f_bh));
        f_s := -m_hxs + f_p;
        f_tl := (-m_hxs - (f_s - (f_s - -m_hxs))) + (f_p - (f_s - -m_hxs));
        f_w := (f_tl - ((f_tl + f_e) - ((f_tl + f_e) - f_tl))) + (f_e - ((f_tl + f_e) - f_tl));
        m_u := f_s + (f_tl + f_e);
        if f_w <> 0 and ((f_s - (m_u - (m_u - f_s))) + ((f_tl + f_e) - (m_u - f_s))) <> 0 and (m_u + 2 * ((f_s - (m_u - (m_u - f_s))) + ((f_tl + f_e) - (m_u - f_s)))) - m_u = 2 * ((f_s - (m_u - (m_u - f_s))) + ((f_tl + f_e) - (m_u - f_s))) and (f_w < 0) = (((f_s - (m_u - (m_u - f_s))) + ((f_tl + f_e) - (m_u - f_s))) < 0) then m_u := m_u + 2 * ((f_s - (m_u - (m_u - f_s))) + ((f_tl + f_e) - (m_u - f_s))); end if;
      elsif m_x = 0 or m_e = 0 then
        m_u := m_x * m_e + -m_hxs;
      else
        m_u := fdlibm_fma_wide(a => m_x, b => m_e, c => -m_hxs);
      end if;
      t := m_x - m_u; exit;
    end if;
    f_b := m_e - m_c;
    if abs(m_x) >= 1e-144 and abs(m_x) <= 1e144 and abs(f_b) >= 1e-144 and abs(f_b) <= 1e144 and abs(-m_c) <= 1e288 then
      f_p := m_x * f_b;
      f_ah := (m_x * 134217729 - (m_x * 134217729 - m_x));
      f_bh := (f_b * 134217729 - (f_b * 134217729 - f_b));
      f_e := (m_x - f_ah) * (f_b - f_bh) - (((f_p - f_ah * f_bh) - (m_x - f_ah) * f_bh) - f_ah * (f_b - f_bh));
      f_s := -m_c + f_p;
      f_tl := (-m_c - (f_s - (f_s - -m_c))) + (f_p - (f_s - -m_c));
      f_w := (f_tl - ((f_tl + f_e) - ((f_tl + f_e) - f_tl))) + (f_e - ((f_tl + f_e) - f_tl));
      m_e := f_s + (f_tl + f_e);
      if f_w <> 0 and ((f_s - (m_e - (m_e - f_s))) + ((f_tl + f_e) - (m_e - f_s))) <> 0 and (m_e + 2 * ((f_s - (m_e - (m_e - f_s))) + ((f_tl + f_e) - (m_e - f_s)))) - m_e = 2 * ((f_s - (m_e - (m_e - f_s))) + ((f_tl + f_e) - (m_e - f_s))) and (f_w < 0) = (((f_s - (m_e - (m_e - f_s))) + ((f_tl + f_e) - (m_e - f_s))) < 0) then m_e := m_e + 2 * ((f_s - (m_e - (m_e - f_s))) + ((f_tl + f_e) - (m_e - f_s))); end if;
    elsif m_x = 0 or f_b = 0 then
      m_e := m_x * f_b + -m_c;
    else
      m_e := fdlibm_fma_wide(a => m_x, b => f_b, c => -m_c);
    end if;
    m_e := m_e - m_hxs;
    if m_k = -1 then t := 0.5 * (m_x - m_e) - 0.5; exit; end if;
    if m_k = 1 then
      if m_x < -0.25 then t := -2 * (m_e - (m_x + 0.5)); exit; end if;
      t := 1 + 2 * (m_x - m_e); exit;
    end if;
    if m_k <= -2 or m_k > 56 then
      m_y := 1 - (m_e - m_x);
      if m_k = 1024 then
        if m_y >= 1 then t := 'Infinity'; exit; end if;
        m_y := m_y * 2 * 8.98846567431158e+307;
      else
        m_y := m_y * (('{2.2250738585072014e-308,4.1045368012983762e-289,7.571533991467358e-270,1.3967014978599092e-250,2.5764595078388533e-231,4.7527289157379e-212,8.767237396033612e-193,1.617269844780878e-173,2.983336292480083e-154,5.503284107318959e-135,1.0151767349262597e-115,1.8726705418768793e-96,3.454467422037778e-77,6.372367644529809e-58,1.1754943508222875e-38,2.168404344971009e-19,4,73786976294838210000,1.361129467683754e+39,2.5108406941546723e+58,4.631683569492648e+77,8.54394814368364e+96,1.5760802478557792e+116,2.9073548971824276e+135,5.363123171977039e+154,9.893216058924181e+173,1.824976247048878e+193,3.366486976990959e+212,6.210072369202836e+231,1.1455561567389984e+251,2.113178124542661e+270,3.89812560456e+289}'::float8[])[(((m_k) + 1022) >> 6) + 1] * ('{1,2,4,8,16,32,64,128,256,512,1024,2048,4096,8192,16384,32768,65536,131072,262144,524288,1048576,2097152,4194304,8388608,16777216,33554432,67108864,134217728,268435456,536870912,1073741824,2147483648,4294967296,8589934592,17179869184,34359738368,68719476736,137438953472,274877906944,549755813888,1099511627776,2199023255552,4398046511104,8796093022208,17592186044416,35184372088832,70368744177664,140737488355328,281474976710656,562949953421312,1125899906842624,2251799813685248,4503599627370496,9007199254740992,18014398509481984,36028797018963970,72057594037927940,144115188075855870,288230376151711740,576460752303423500,1152921504606847000,2305843009213694000,4611686018427388000,9223372036854776000}'::float8[])[(((m_k) + 1022) & 63) + 1]);
      end if;
      t := m_y - 1; exit;
    end if;
    if m_k < 20 then
      m_y := (1 - (('{2.2250738585072014e-308,4.1045368012983762e-289,7.571533991467358e-270,1.3967014978599092e-250,2.5764595078388533e-231,4.7527289157379e-212,8.767237396033612e-193,1.617269844780878e-173,2.983336292480083e-154,5.503284107318959e-135,1.0151767349262597e-115,1.8726705418768793e-96,3.454467422037778e-77,6.372367644529809e-58,1.1754943508222875e-38,2.168404344971009e-19,4,73786976294838210000,1.361129467683754e+39,2.5108406941546723e+58,4.631683569492648e+77,8.54394814368364e+96,1.5760802478557792e+116,2.9073548971824276e+135,5.363123171977039e+154,9.893216058924181e+173,1.824976247048878e+193,3.366486976990959e+212,6.210072369202836e+231,1.1455561567389984e+251,2.113178124542661e+270,3.89812560456e+289}'::float8[])[(((-m_k) + 1022) >> 6) + 1] * ('{1,2,4,8,16,32,64,128,256,512,1024,2048,4096,8192,16384,32768,65536,131072,262144,524288,1048576,2097152,4194304,8388608,16777216,33554432,67108864,134217728,268435456,536870912,1073741824,2147483648,4294967296,8589934592,17179869184,34359738368,68719476736,137438953472,274877906944,549755813888,1099511627776,2199023255552,4398046511104,8796093022208,17592186044416,35184372088832,70368744177664,140737488355328,281474976710656,562949953421312,1125899906842624,2251799813685248,4503599627370496,9007199254740992,18014398509481984,36028797018963970,72057594037927940,144115188075855870,288230376151711740,576460752303423500,1152921504606847000,2305843009213694000,4611686018427388000,9223372036854776000}'::float8[])[(((-m_k) + 1022) & 63) + 1])) - (m_e - m_x);
    else
      m_y := (m_x - (m_e + (('{2.2250738585072014e-308,4.1045368012983762e-289,7.571533991467358e-270,1.3967014978599092e-250,2.5764595078388533e-231,4.7527289157379e-212,8.767237396033612e-193,1.617269844780878e-173,2.983336292480083e-154,5.503284107318959e-135,1.0151767349262597e-115,1.8726705418768793e-96,3.454467422037778e-77,6.372367644529809e-58,1.1754943508222875e-38,2.168404344971009e-19,4,73786976294838210000,1.361129467683754e+39,2.5108406941546723e+58,4.631683569492648e+77,8.54394814368364e+96,1.5760802478557792e+116,2.9073548971824276e+135,5.363123171977039e+154,9.893216058924181e+173,1.824976247048878e+193,3.366486976990959e+212,6.210072369202836e+231,1.1455561567389984e+251,2.113178124542661e+270,3.89812560456e+289}'::float8[])[(((-m_k) + 1022) >> 6) + 1] * ('{1,2,4,8,16,32,64,128,256,512,1024,2048,4096,8192,16384,32768,65536,131072,262144,524288,1048576,2097152,4194304,8388608,16777216,33554432,67108864,134217728,268435456,536870912,1073741824,2147483648,4294967296,8589934592,17179869184,34359738368,68719476736,137438953472,274877906944,549755813888,1099511627776,2199023255552,4398046511104,8796093022208,17592186044416,35184372088832,70368744177664,140737488355328,281474976710656,562949953421312,1125899906842624,2251799813685248,4503599627370496,9007199254740992,18014398509481984,36028797018963970,72057594037927940,144115188075855870,288230376151711740,576460752303423500,1152921504606847000,2305843009213694000,4611686018427388000,9223372036854776000}'::float8[])[(((-m_k) + 1022) & 63) + 1]))) + 1;
    end if;
    t := m_y * (('{2.2250738585072014e-308,4.1045368012983762e-289,7.571533991467358e-270,1.3967014978599092e-250,2.5764595078388533e-231,4.7527289157379e-212,8.767237396033612e-193,1.617269844780878e-173,2.983336292480083e-154,5.503284107318959e-135,1.0151767349262597e-115,1.8726705418768793e-96,3.454467422037778e-77,6.372367644529809e-58,1.1754943508222875e-38,2.168404344971009e-19,4,73786976294838210000,1.361129467683754e+39,2.5108406941546723e+58,4.631683569492648e+77,8.54394814368364e+96,1.5760802478557792e+116,2.9073548971824276e+135,5.363123171977039e+154,9.893216058924181e+173,1.824976247048878e+193,3.366486976990959e+212,6.210072369202836e+231,1.1455561567389984e+251,2.113178124542661e+270,3.89812560456e+289}'::float8[])[(((m_k) + 1022) >> 6) + 1] * ('{1,2,4,8,16,32,64,128,256,512,1024,2048,4096,8192,16384,32768,65536,131072,262144,524288,1048576,2097152,4194304,8388608,16777216,33554432,67108864,134217728,268435456,536870912,1073741824,2147483648,4294967296,8589934592,17179869184,34359738368,68719476736,137438953472,274877906944,549755813888,1099511627776,2199023255552,4398046511104,8796093022208,17592186044416,35184372088832,70368744177664,140737488355328,281474976710656,562949953421312,1125899906842624,2251799813685248,4503599627370496,9007199254740992,18014398509481984,36028797018963970,72057594037927940,144115188075855870,288230376151711740,576460752303423500,1152921504606847000,2305843009213694000,4611686018427388000,9223372036854776000}'::float8[])[(((m_k) + 1022) & 63) + 1]); exit;
  end loop;

      z := -t / (t + 2);
    end if;
  else
    z := 1;
  end if;
  return case when jx >= 0 then z else -z end;
end $$;

-- V8's math::pow (src/numbers/ieee754.cc; `**` and Math.pow in every tier): NaN for a NaN exponent and for ±1 to
-- ±∞, x × x for an exponent of 2, sqrt(x + 0) for 0.5 (∞ for -∞); otherwise glibc 2.43's pow
-- (sysdeps/ieee754/dbl-64/e_pow.c: __pow, log_inline, exp_inline, specialcase) as libm.so.6 runs it on AArch64:
-- every fused operation is one of its fmadd, fmsub or fnmsub, round and lround are frinta and fcvtas (ties away from
-- zero), and specialcase's k < 0 branch is unfused as the binary has it. kd × Ln2hi is exact (11 by 42 bits), so its
-- fused and unfused forms agree; fma(z, invc, -1) is exact as glibc designs it (invc has 8 bits, so z split in
-- halves of 26 and 27 bits gives two exact products and an exact sum); fma(r, ar, -ar2) and fma(y, hi, -ehi) are the
-- rounding errors of products, exact by Dekker's method (|y| < 2^63, and log(x) is 0 or above 2^-60). The scale
-- 2^(k/128) is the table's 2^(j/128) times an exact power of two, and z of log_inline is x scaled by one.
create function p3.fdlibm_pow(x float8, y float8) returns float8 language plpgsql immutable as $$
declare f_a float8; f_b float8; f_c float8; f_p float8; f_ah float8; f_bh float8; f_e float8; f_s float8; f_tl float8; f_w float8;
  ix bigint; iy bigint; topx int; topy int; sign_bias boolean := false; yint int; x2 float8; xs float8; kz int := 0;
  tmp bigint; i int; k int; z float8; kd float8; r float8; t1 float8; t2 float8; lo1 float8; lo2 float8;
  ar float8; ar2 float8; ar3 float8; hi float8; lo3 float8; lo4 float8; lo float8; lhi float8; ltail float8;
  ehi float8; elo float8; abstop int; ki bigint; j int; r2 float8; scale float8; e float8; ey float8; one float8; u float8; v float8;
begin
  if y = 'NaN' then return 'NaN'; end if;
  if abs(y) = 'Infinity' and abs(x) = 1 then return 'NaN'; end if;
  if y = 2 then
    if abs(x) >= 1e-150 and abs(x) <= 1e150 then return x * x; end if;
    return fdlibm_fma_wide(a => x, b => x, c => 0);
  end if;
  if y = 0.5 then
    if abs(x) = 'Infinity' then return 'Infinity'; end if;
    if x < 0 then return 'NaN'; end if;
    return sqrt(x + 0);
  end if;
  ix := int8(float8send(x));
  iy := int8(float8send(y));
  topx := ((ix >> 52) & 4095)::int;
  topy := ((iy >> 52) & 4095)::int;
  xs := x;
  if topx = 0 or topx >= 0x7FF or (topy & 0x7FF) < 0x3BE or (topy & 0x7FF) >= 0x43E then
    if (iy & 9223372036854775807) = 0 or (iy & 9218868437227405312) = 9218868437227405312 then
      if (iy & 9223372036854775807) = 0 then return 1; end if;
      if ix = 4607182418800017408 then return 1; end if;
      if x = 'NaN' or y = 'NaN' then return x + y; end if;
      if (ix & 9223372036854775807) = 4607182418800017408 then return 1; end if;
      if ((ix & 9223372036854775807) < 4607182418800017408) = (iy >= 0) then return 0; end if;
      return y * y;
    end if;
    if (ix & 9223372036854775807) = 0 or (ix & 9218868437227405312) = 9218868437227405312 then
      x2 := x * x;
      if ix < 0 and (case when ((iy >> 52) & 2047) < 0x3FF then 0 when ((iy >> 52) & 2047) > 0x433 then 2
    when (iy & ((1::bigint << (0x433 - (((iy >> 52) & 2047)::int))) - 1)) <> 0 then 0
    when (iy & (1::bigint << (0x433 - (((iy >> 52) & 2047)::int)))) <> 0 then 1 else 2 end)
 = 1 then x2 := -x2; sign_bias := true; end if;
      if (ix & 9223372036854775807) = 0 and iy < 0 then
        return case when sign_bias then '-Infinity'::float8 else 'Infinity'::float8 end;
      end if;
      return case when iy < 0 then 1 / x2 else x2 end;
    end if;
    if ix < 0 then
      yint := (case when ((iy >> 52) & 2047) < 0x3FF then 0 when ((iy >> 52) & 2047) > 0x433 then 2
    when (iy & ((1::bigint << (0x433 - (((iy >> 52) & 2047)::int))) - 1)) <> 0 then 0
    when (iy & (1::bigint << (0x433 - (((iy >> 52) & 2047)::int)))) <> 0 then 1 else 2 end)
;
      if yint = 0 then return 'NaN'; end if;
      sign_bias := yint = 1;
      ix := ix & 9223372036854775807;
      topx := topx & 0x7FF;
      xs := -x;
    end if;
    if (topy & 0x7FF) < 0x3BE or (topy & 0x7FF) >= 0x43E then
      if ix = 4607182418800017408 then return 1; end if;
      if (topy & 0x7FF) < 0x3BE then return case when ix > 4607182418800017408 then 1 + y else 1 - y end; end if;
      return case when (ix > 4607182418800017408) = (topy < 0x800) then 'Infinity'::float8 else 0::float8 end;
    end if;
    if topx = 0 then
      xs := xs * 4503599627370496;
      ix := int8(float8send(xs)) - 234187180623265792;
      kz := 52;
    end if;
  end if;
  -- log_inline: lhi + ltail = log(x)
  tmp := ix - 4604531861337669632;
  i := ((tmp >> 45) & 127)::int;
  k := (tmp >> 52)::int;
  z := xs * (case when (-(k + kz)) >= -1022 then (('{2.2250738585072014e-308,4.1045368012983762e-289,7.571533991467358e-270,1.3967014978599092e-250,2.5764595078388533e-231,4.7527289157379e-212,8.767237396033612e-193,1.617269844780878e-173,2.983336292480083e-154,5.503284107318959e-135,1.0151767349262597e-115,1.8726705418768793e-96,3.454467422037778e-77,6.372367644529809e-58,1.1754943508222875e-38,2.168404344971009e-19,4,73786976294838210000,1.361129467683754e+39,2.5108406941546723e+58,4.631683569492648e+77,8.54394814368364e+96,1.5760802478557792e+116,2.9073548971824276e+135,5.363123171977039e+154,9.893216058924181e+173,1.824976247048878e+193,3.366486976990959e+212,6.210072369202836e+231,1.1455561567389984e+251,2.113178124542661e+270,3.89812560456e+289}'::float8[])[(((-(k + kz)) + 1022) >> 6) + 1] * ('{1,2,4,8,16,32,64,128,256,512,1024,2048,4096,8192,16384,32768,65536,131072,262144,524288,1048576,2097152,4194304,8388608,16777216,33554432,67108864,134217728,268435456,536870912,1073741824,2147483648,4294967296,8589934592,17179869184,34359738368,68719476736,137438953472,274877906944,549755813888,1099511627776,2199023255552,4398046511104,8796093022208,17592186044416,35184372088832,70368744177664,140737488355328,281474976710656,562949953421312,1125899906842624,2251799813685248,4503599627370496,9007199254740992,18014398509481984,36028797018963970,72057594037927940,144115188075855870,288230376151711740,576460752303423500,1152921504606847000,2305843009213694000,4611686018427388000,9223372036854776000}'::float8[])[(((-(k + kz)) + 1022) & 63) + 1]) else 2.2250738585072014e-308 * ('{0.5,0.25,0.125,0.0625,0.03125,0.015625,0.0078125,0.00390625,0.001953125,0.0009765625,0.00048828125,0.000244140625,0.0001220703125,0.00006103515625,0.000030517578125,0.0000152587890625,0.00000762939453125,0.000003814697265625,0.0000019073486328125,9.5367431640625e-7,4.76837158203125e-7,2.384185791015625e-7,1.1920928955078125e-7,5.960464477539063e-8,2.9802322387695312e-8,1.4901161193847656e-8,7.450580596923828e-9,3.725290298461914e-9,1.862645149230957e-9,9.313225746154785e-10,4.656612873077393e-10,2.3283064365386963e-10,1.1641532182693481e-10,5.820766091346741e-11,2.9103830456733704e-11,1.4551915228366852e-11,7.275957614183426e-12,3.637978807091713e-12,1.8189894035458565e-12,9.094947017729282e-13,4.547473508864641e-13,2.2737367544323206e-13,1.1368683772161603e-13,5.684341886080802e-14,2.842170943040401e-14,1.4210854715202004e-14,7.105427357601002e-15,3.552713678800501e-15,1.7763568394002505e-15,8.881784197001252e-16,4.440892098500626e-16,2.220446049250313e-16}'::float8[])[-1022 - (-(k + kz))] end);
  kd := k;
  u := z * 134217729 - (z * 134217729 - z);
  r := (u * ('{1.4140625,1.40625,1.3984375,1.390625,1.3828125,1.375,1.3671875,1.359375,1.3515625,1.34375,1.3359375,1.3359375,1.328125,1.3203125,1.3125,1.3046875,1.296875,1.2890625,1.2890625,1.28125,1.2734375,1.265625,1.2578125,1.25,1.25,1.2421875,1.234375,1.2265625,1.2265625,1.21875,1.2109375,1.203125,1.203125,1.1953125,1.1875,1.1875,1.1796875,1.171875,1.171875,1.1640625,1.15625,1.1484375,1.1484375,1.140625,1.140625,1.1328125,1.125,1.125,1.1171875,1.109375,1.109375,1.1015625,1.1015625,1.09375,1.0859375,1.0859375,1.078125,1.078125,1.0703125,1.0625,1.0625,1.0546875,1.0546875,1.046875,1.046875,1.0390625,1.0390625,1.03125,1.03125,1.0234375,1.015625,1.015625,1.0078125,1.0078125,1,1,0.9921875,0.984375,0.9765625,0.96875,0.9609375,0.953125,0.9453125,0.94140625,0.93359375,0.92578125,0.91796875,0.9140625,0.90625,0.8984375,0.89453125,0.88671875,0.8828125,0.875,0.87109375,0.86328125,0.859375,0.8515625,0.84765625,0.83984375,0.8359375,0.83203125,0.82421875,0.8203125,0.8125,0.80859375,0.8046875,0.80078125,0.79296875,0.7890625,0.78515625,0.78125,0.7734375,0.76953125,0.765625,0.76171875,0.7578125,0.75390625,0.74609375,0.7421875,0.73828125,0.734375,0.73046875,0.7265625,0.72265625,0.71875,0.71484375,0.7109375}'::float8[])[i + 1] - 1) + (z - u) * ('{1.4140625,1.40625,1.3984375,1.390625,1.3828125,1.375,1.3671875,1.359375,1.3515625,1.34375,1.3359375,1.3359375,1.328125,1.3203125,1.3125,1.3046875,1.296875,1.2890625,1.2890625,1.28125,1.2734375,1.265625,1.2578125,1.25,1.25,1.2421875,1.234375,1.2265625,1.2265625,1.21875,1.2109375,1.203125,1.203125,1.1953125,1.1875,1.1875,1.1796875,1.171875,1.171875,1.1640625,1.15625,1.1484375,1.1484375,1.140625,1.140625,1.1328125,1.125,1.125,1.1171875,1.109375,1.109375,1.1015625,1.1015625,1.09375,1.0859375,1.0859375,1.078125,1.078125,1.0703125,1.0625,1.0625,1.0546875,1.0546875,1.046875,1.046875,1.0390625,1.0390625,1.03125,1.03125,1.0234375,1.015625,1.015625,1.0078125,1.0078125,1,1,0.9921875,0.984375,0.9765625,0.96875,0.9609375,0.953125,0.9453125,0.94140625,0.93359375,0.92578125,0.91796875,0.9140625,0.90625,0.8984375,0.89453125,0.88671875,0.8828125,0.875,0.87109375,0.86328125,0.859375,0.8515625,0.84765625,0.83984375,0.8359375,0.83203125,0.82421875,0.8203125,0.8125,0.80859375,0.8046875,0.80078125,0.79296875,0.7890625,0.78515625,0.78125,0.7734375,0.76953125,0.765625,0.76171875,0.7578125,0.75390625,0.74609375,0.7421875,0.73828125,0.734375,0.73046875,0.7265625,0.72265625,0.71875,0.71484375,0.7109375}'::float8[])[i + 1];
  t1 := kd * 0.6931471805598903::float8 + ('{-0.3464667673462145,-0.34092658697056777,-0.3353555419211034,-0.3297532863724655,-0.32411946865420305,-0.31845373111855224,-0.31275571000389846,-0.3070250352949415,-0.3012613305781997,-0.2954642128938758,-0.28963329258306203,-0.28963329258306203,-0.28376817313062475,-0.27786845100342816,-0.2719337154836694,-0.2659635484970977,-0.25995752443691345,-0.25391520998095984,-0.25391520998095984,-0.2478361639045943,-0.2417199368871934,-0.23556607131274632,-0.22937410106487732,-0.22314355131425145,-0.22314355131425145,-0.21687393830063684,-0.21056476910735,-0.2042155414286526,-0.2042155414286526,-0.19782574332987224,-0.19139485299967873,-0.18492233849406148,-0.18492233849406148,-0.1784076574728033,-0.17185025692663203,-0.17185025692663203,-0.1652495728952772,-0.15860503017665906,-0.15860503017665906,-0.15191604202584585,-0.1451820098444614,-0.13840232285906495,-0.13840232285906495,-0.131576357788731,-0.131576357788731,-0.12470347850091912,-0.11778303565643,-0.11778303565643,-0.11081436634026431,-0.10379679368168127,-0.10379679368168127,-0.09672962645856842,-0.09672962645856842,-0.089612158689647,-0.08244366921110213,-0.08244366921110213,-0.07522342123763792,-0.07522342123763792,-0.06795066190852594,-0.06062462181648698,-0.06062462181648698,-0.053244514518837605,-0.053244514518837605,-0.045809536031242715,-0.045809536031242715,-0.038318864302141264,-0.038318864302141264,-0.03077165866670839,-0.03077165866670839,-0.023167059281490765,-0.015504186535963527,-0.015504186535963527,-0.0077821404420319595,-0.0077821404420319595,0,0,0.007843177461040796,0.01574835696817445,0.023716526617363343,0.03174869831457272,0.039845908547249564,0.048009219186383234,0.056239718322899535,0.06038051098892083,0.06871389254808946,0.07711730334438016,0.08559193033545398,0.08985632912185793,0.09844007281321865,0.10709813555638448,0.11145544092528326,0.12022742699821265,0.12464244520731427,0.13353139262449076,0.13800567301939282,0.14701474296180095,0.15154989812720032,0.16068238169043525,0.16528009093906348,0.17453941635187675,0.17920142945774842,0.18388527877016259,0.1933193110035063,0.19806991376208316,0.20763936477828793,0.21245865121420593,0.21730127569003344,0.22216746534115828,0.2319714654378231,0.2369097470783572,0.24187253642048745,0.2468600779315011,0.2569104137850218,0.26197371574153294,0.2670627852490952,0.27217788591576664,0.27731928541618345,0.28248725557466514,0.29290401643288533,0.29815337231912054,0.3034304294199046,0.30873548164959175,0.3140688276249648,0.31943077076641657,0.3248216194012912,0.33024168687052224,0.3356912916381134,0.3411707574027787}'::float8[])[i + 1];
  t2 := t1 + r;
  f_c := ('{5.929407345889625e-15,-2.544157440035963e-14,-3.443525940775045e-14,-2.500123826022799e-15,-8.929337133850617e-15,1.7625431312172662e-14,1.5688303180062087e-15,2.9655274673691784e-14,3.7923164802093147e-14,3.993416384387844e-14,1.9352855826489123e-14,1.9352855826489123e-14,-1.9852665484979036e-14,-2.814323765595281e-14,2.7643769993528702e-14,-4.025092402293806e-14,-1.2621729398885316e-14,-3.600176732637335e-15,-3.600176732637335e-15,1.3029797173308663e-14,4.8230289429940886e-14,-2.0592242769647135e-14,3.149265065191484e-14,4.169796584527195e-14,4.169796584527195e-14,2.2477465222466186e-14,3.6507188831790577e-16,-3.827767260205414e-14,-3.827767260205414e-14,-4.7641388950792196e-14,4.9278276214647115e-14,4.9485167661250996e-14,4.9485167661250996e-14,-1.5003333854266542e-14,-2.7194441649495324e-14,-2.7194441649495324e-14,-2.99659267292569e-14,2.0472357800461955e-14,2.0472357800461955e-14,3.879296723063646e-15,-3.6506824353335045e-14,-5.4183331379008994e-14,-5.4183331379008994e-14,1.1729485484531301e-14,1.1729485484531301e-14,-3.811763084710266e-14,4.654729747598445e-14,4.654729747598445e-14,-2.5799991283069902e-14,3.7700471749674615e-14,3.7700471749674615e-14,1.7306161136093256e-14,1.7306161136093256e-14,-4.012913552726574e-14,2.7541708360737882e-14,2.7541708360737882e-14,5.0396178134370583e-14,5.0396178134370583e-14,1.8195060030168815e-14,5.213620639136504e-14,5.213620639136504e-14,2.532168943117445e-14,2.532168943117445e-14,-5.148849572685811e-14,-5.148849572685811e-14,4.6652946995830086e-15,4.6652946995830086e-15,-4.529814257790929e-14,-4.529814257790929e-14,-4.361324067851568e-14,-1.7274567499706107e-15,-1.7274567499706107e-15,-2.298941004620351e-14,-2.298941004620351e-14,0,0,-1.4902732911301337e-14,-3.527980389655325e-14,-4.730054772033249e-14,7.580310369375161e-15,-4.9893776716773285e-14,-2.262629393030674e-14,-2.345674491018699e-14,-1.3352588834854848e-14,-3.765296820388875e-14,5.1128335719851986e-14,-5.046674438470119e-14,3.1218748807418837e-15,3.3871241029241416e-14,-1.7376727386423858e-14,3.957125899799804e-14,-5.2849453521890294e-14,-3.767012502308738e-14,3.1859736349078334e-14,5.0900642926060466e-14,8.710783796122478e-15,6.157896229122976e-16,3.821577743916796e-14,3.9440046718453496e-14,2.2924522154618074e-14,-3.742530094732263e-14,-2.5223102140407338e-14,-1.0320443688698849e-14,1.0634128304268335e-14,-4.3425422595242564e-14,-1.2527395755711364e-14,-5.204008743405884e-14,-3.979844515951702e-15,-4.7955860343296286e-14,5.015686013791602e-16,-7.252318953240293e-16,2.4688324156011588e-14,5.465121253624792e-15,4.102651071698446e-14,-4.996736502345936e-14,4.903580708156347e-14,5.089628039500759e-14,1.1782016386565151e-14,4.727452940514406e-14,-4.4204083338755686e-14,1.548345993498083e-14,2.1522127491642888e-14,1.1054030169005386e-14,-5.534326352070679e-14,-5.351646604259541e-14,5.4612144489920215e-14,2.8136969901227338e-14,-1.156568624616423e-14}'::float8[])[i + 1];
  if abs(kd) >= 1e-144 and abs(kd) <= 1e144 and abs((5.497923018708371e-14::float8)::float8) >= 1e-144 and abs((5.497923018708371e-14::float8)::float8) <= 1e144 and abs(f_c) <= 1e288 then
    f_p := kd * (5.497923018708371e-14::float8)::float8;
    f_ah := (kd * 134217729 - (kd * 134217729 - kd));
    f_e := (kd - f_ah) * ((5.497923018708371e-14::float8)::float8 - ((5.497923018708371e-14::float8)::float8 * 134217729 - ((5.497923018708371e-14::float8)::float8 * 134217729 - (5.497923018708371e-14::float8)::float8))) - (((f_p - f_ah * ((5.497923018708371e-14::float8)::float8 * 134217729 - ((5.497923018708371e-14::float8)::float8 * 134217729 - (5.497923018708371e-14::float8)::float8))) - (kd - f_ah) * ((5.497923018708371e-14::float8)::float8 * 134217729 - ((5.497923018708371e-14::float8)::float8 * 134217729 - (5.497923018708371e-14::float8)::float8))) - f_ah * ((5.497923018708371e-14::float8)::float8 - ((5.497923018708371e-14::float8)::float8 * 134217729 - ((5.497923018708371e-14::float8)::float8 * 134217729 - (5.497923018708371e-14::float8)::float8))));
    f_s := f_c + f_p;
    f_tl := (f_c - (f_s - (f_s - f_c))) + (f_p - (f_s - f_c));
    f_w := (f_tl - ((f_tl + f_e) - ((f_tl + f_e) - f_tl))) + (f_e - ((f_tl + f_e) - f_tl));
    lo1 := f_s + (f_tl + f_e);
    if f_w <> 0 and ((f_s - (lo1 - (lo1 - f_s))) + ((f_tl + f_e) - (lo1 - f_s))) <> 0 and (lo1 + 2 * ((f_s - (lo1 - (lo1 - f_s))) + ((f_tl + f_e) - (lo1 - f_s)))) - lo1 = 2 * ((f_s - (lo1 - (lo1 - f_s))) + ((f_tl + f_e) - (lo1 - f_s))) and (f_w < 0) = (((f_s - (lo1 - (lo1 - f_s))) + ((f_tl + f_e) - (lo1 - f_s))) < 0) then lo1 := lo1 + 2 * ((f_s - (lo1 - (lo1 - f_s))) + ((f_tl + f_e) - (lo1 - f_s))); end if;
  elsif kd = 0 or (5.497923018708371e-14::float8)::float8 = 0 then
    lo1 := kd * (5.497923018708371e-14::float8)::float8 + f_c;
  else
    lo1 := fdlibm_fma_wide(a => kd, b => (5.497923018708371e-14::float8)::float8, c => f_c);
  end if;
  lo2 := (t1 - t2) + r;
  ar := r * -0.5::float8;
  ar2 := r * ar;
  ar3 := r * ar2;
  hi := t2 + ar2;
  f_ah := r * 134217729 - (r * 134217729 - r);
  f_bh := ar * 134217729 - (ar * 134217729 - ar);
  lo3 := (r - f_ah) * (ar - f_bh) - (((ar2 - f_ah * f_bh) - (r - f_ah) * f_bh) - f_ah * (ar - f_bh));
  lo4 := (t2 - hi) + ar2;
  if abs(r) >= 1e-144 and abs(r) <= 1e144 and abs((1.0000415263675542::float8)::float8) >= 1e-144 and abs((1.0000415263675542::float8)::float8) <= 1e144 and abs((-1.142909628459501::float8)::float8) <= 1e288 then
    f_p := r * (1.0000415263675542::float8)::float8;
    f_ah := (r * 134217729 - (r * 134217729 - r));
    f_e := (r - f_ah) * ((1.0000415263675542::float8)::float8 - ((1.0000415263675542::float8)::float8 * 134217729 - ((1.0000415263675542::float8)::float8 * 134217729 - (1.0000415263675542::float8)::float8))) - (((f_p - f_ah * ((1.0000415263675542::float8)::float8 * 134217729 - ((1.0000415263675542::float8)::float8 * 134217729 - (1.0000415263675542::float8)::float8))) - (r - f_ah) * ((1.0000415263675542::float8)::float8 * 134217729 - ((1.0000415263675542::float8)::float8 * 134217729 - (1.0000415263675542::float8)::float8))) - f_ah * ((1.0000415263675542::float8)::float8 - ((1.0000415263675542::float8)::float8 * 134217729 - ((1.0000415263675542::float8)::float8 * 134217729 - (1.0000415263675542::float8)::float8))));
    f_s := (-1.142909628459501::float8)::float8 + f_p;
    f_tl := ((-1.142909628459501::float8)::float8 - (f_s - (f_s - (-1.142909628459501::float8)::float8))) + (f_p - (f_s - (-1.142909628459501::float8)::float8));
    f_w := (f_tl - ((f_tl + f_e) - ((f_tl + f_e) - f_tl))) + (f_e - ((f_tl + f_e) - f_tl));
    u := f_s + (f_tl + f_e);
    if f_w <> 0 and ((f_s - (u - (u - f_s))) + ((f_tl + f_e) - (u - f_s))) <> 0 and (u + 2 * ((f_s - (u - (u - f_s))) + ((f_tl + f_e) - (u - f_s)))) - u = 2 * ((f_s - (u - (u - f_s))) + ((f_tl + f_e) - (u - f_s))) and (f_w < 0) = (((f_s - (u - (u - f_s))) + ((f_tl + f_e) - (u - f_s))) < 0) then u := u + 2 * ((f_s - (u - (u - f_s))) + ((f_tl + f_e) - (u - f_s))); end if;
  elsif r = 0 or (1.0000415263675542::float8)::float8 = 0 then
    u := r * (1.0000415263675542::float8)::float8 + (-1.142909628459501::float8)::float8;
  else
    u := fdlibm_fma_wide(a => r, b => (1.0000415263675542::float8)::float8, c => (-1.142909628459501::float8)::float8);
  end if;
  if abs(r) >= 1e-144 and abs(r) <= 1e144 and abs((-0.6666666663487739::float8)::float8) >= 1e-144 and abs((-0.6666666663487739::float8)::float8) <= 1e144 and abs((0.7999999995323976::float8)::float8) <= 1e288 then
    f_p := r * (-0.6666666663487739::float8)::float8;
    f_ah := (r * 134217729 - (r * 134217729 - r));
    f_e := (r - f_ah) * ((-0.6666666663487739::float8)::float8 - ((-0.6666666663487739::float8)::float8 * 134217729 - ((-0.6666666663487739::float8)::float8 * 134217729 - (-0.6666666663487739::float8)::float8))) - (((f_p - f_ah * ((-0.6666666663487739::float8)::float8 * 134217729 - ((-0.6666666663487739::float8)::float8 * 134217729 - (-0.6666666663487739::float8)::float8))) - (r - f_ah) * ((-0.6666666663487739::float8)::float8 * 134217729 - ((-0.6666666663487739::float8)::float8 * 134217729 - (-0.6666666663487739::float8)::float8))) - f_ah * ((-0.6666666663487739::float8)::float8 - ((-0.6666666663487739::float8)::float8 * 134217729 - ((-0.6666666663487739::float8)::float8 * 134217729 - (-0.6666666663487739::float8)::float8))));
    f_s := (0.7999999995323976::float8)::float8 + f_p;
    f_tl := ((0.7999999995323976::float8)::float8 - (f_s - (f_s - (0.7999999995323976::float8)::float8))) + (f_p - (f_s - (0.7999999995323976::float8)::float8));
    f_w := (f_tl - ((f_tl + f_e) - ((f_tl + f_e) - f_tl))) + (f_e - ((f_tl + f_e) - f_tl));
    v := f_s + (f_tl + f_e);
    if f_w <> 0 and ((f_s - (v - (v - f_s))) + ((f_tl + f_e) - (v - f_s))) <> 0 and (v + 2 * ((f_s - (v - (v - f_s))) + ((f_tl + f_e) - (v - f_s)))) - v = 2 * ((f_s - (v - (v - f_s))) + ((f_tl + f_e) - (v - f_s))) and (f_w < 0) = (((f_s - (v - (v - f_s))) + ((f_tl + f_e) - (v - f_s))) < 0) then v := v + 2 * ((f_s - (v - (v - f_s))) + ((f_tl + f_e) - (v - f_s))); end if;
  elsif r = 0 or (-0.6666666663487739::float8)::float8 = 0 then
    v := r * (-0.6666666663487739::float8)::float8 + (0.7999999995323976::float8)::float8;
  else
    v := fdlibm_fma_wide(a => r, b => (-0.6666666663487739::float8)::float8, c => (0.7999999995323976::float8)::float8);
  end if;
  if abs(ar2) >= 1e-144 and abs(ar2) <= 1e144 and abs(u) >= 1e-144 and abs(u) <= 1e144 and abs(v) <= 1e288 then
    f_p := ar2 * u;
    f_ah := (ar2 * 134217729 - (ar2 * 134217729 - ar2));
    f_bh := (u * 134217729 - (u * 134217729 - u));
    f_e := (ar2 - f_ah) * (u - f_bh) - (((f_p - f_ah * f_bh) - (ar2 - f_ah) * f_bh) - f_ah * (u - f_bh));
    f_s := v + f_p;
    f_tl := (v - (f_s - (f_s - v))) + (f_p - (f_s - v));
    f_w := (f_tl - ((f_tl + f_e) - ((f_tl + f_e) - f_tl))) + (f_e - ((f_tl + f_e) - f_tl));
    u := f_s + (f_tl + f_e);
    if f_w <> 0 and ((f_s - (u - (u - f_s))) + ((f_tl + f_e) - (u - f_s))) <> 0 and (u + 2 * ((f_s - (u - (u - f_s))) + ((f_tl + f_e) - (u - f_s)))) - u = 2 * ((f_s - (u - (u - f_s))) + ((f_tl + f_e) - (u - f_s))) and (f_w < 0) = (((f_s - (u - (u - f_s))) + ((f_tl + f_e) - (u - f_s))) < 0) then u := u + 2 * ((f_s - (u - (u - f_s))) + ((f_tl + f_e) - (u - f_s))); end if;
  elsif ar2 = 0 or u = 0 then
    u := ar2 * u + v;
  else
    u := fdlibm_fma_wide(a => ar2, b => u, c => v);
  end if;
  if abs(r) >= 1e-144 and abs(r) <= 1e144 and abs((0.5000000000000007::float8)::float8) >= 1e-144 and abs((0.5000000000000007::float8)::float8) <= 1e144 and abs((-0.6666666666666679::float8)::float8) <= 1e288 then
    f_p := r * (0.5000000000000007::float8)::float8;
    f_ah := (r * 134217729 - (r * 134217729 - r));
    f_e := (r - f_ah) * ((0.5000000000000007::float8)::float8 - ((0.5000000000000007::float8)::float8 * 134217729 - ((0.5000000000000007::float8)::float8 * 134217729 - (0.5000000000000007::float8)::float8))) - (((f_p - f_ah * ((0.5000000000000007::float8)::float8 * 134217729 - ((0.5000000000000007::float8)::float8 * 134217729 - (0.5000000000000007::float8)::float8))) - (r - f_ah) * ((0.5000000000000007::float8)::float8 * 134217729 - ((0.5000000000000007::float8)::float8 * 134217729 - (0.5000000000000007::float8)::float8))) - f_ah * ((0.5000000000000007::float8)::float8 - ((0.5000000000000007::float8)::float8 * 134217729 - ((0.5000000000000007::float8)::float8 * 134217729 - (0.5000000000000007::float8)::float8))));
    f_s := (-0.6666666666666679::float8)::float8 + f_p;
    f_tl := ((-0.6666666666666679::float8)::float8 - (f_s - (f_s - (-0.6666666666666679::float8)::float8))) + (f_p - (f_s - (-0.6666666666666679::float8)::float8));
    f_w := (f_tl - ((f_tl + f_e) - ((f_tl + f_e) - f_tl))) + (f_e - ((f_tl + f_e) - f_tl));
    v := f_s + (f_tl + f_e);
    if f_w <> 0 and ((f_s - (v - (v - f_s))) + ((f_tl + f_e) - (v - f_s))) <> 0 and (v + 2 * ((f_s - (v - (v - f_s))) + ((f_tl + f_e) - (v - f_s)))) - v = 2 * ((f_s - (v - (v - f_s))) + ((f_tl + f_e) - (v - f_s))) and (f_w < 0) = (((f_s - (v - (v - f_s))) + ((f_tl + f_e) - (v - f_s))) < 0) then v := v + 2 * ((f_s - (v - (v - f_s))) + ((f_tl + f_e) - (v - f_s))); end if;
  elsif r = 0 or (0.5000000000000007::float8)::float8 = 0 then
    v := r * (0.5000000000000007::float8)::float8 + (-0.6666666666666679::float8)::float8;
  else
    v := fdlibm_fma_wide(a => r, b => (0.5000000000000007::float8)::float8, c => (-0.6666666666666679::float8)::float8);
  end if;
  if abs(ar2) >= 1e-144 and abs(ar2) <= 1e144 and abs(u) >= 1e-144 and abs(u) <= 1e144 and abs(v) <= 1e288 then
    f_p := ar2 * u;
    f_ah := (ar2 * 134217729 - (ar2 * 134217729 - ar2));
    f_bh := (u * 134217729 - (u * 134217729 - u));
    f_e := (ar2 - f_ah) * (u - f_bh) - (((f_p - f_ah * f_bh) - (ar2 - f_ah) * f_bh) - f_ah * (u - f_bh));
    f_s := v + f_p;
    f_tl := (v - (f_s - (f_s - v))) + (f_p - (f_s - v));
    f_w := (f_tl - ((f_tl + f_e) - ((f_tl + f_e) - f_tl))) + (f_e - ((f_tl + f_e) - f_tl));
    u := f_s + (f_tl + f_e);
    if f_w <> 0 and ((f_s - (u - (u - f_s))) + ((f_tl + f_e) - (u - f_s))) <> 0 and (u + 2 * ((f_s - (u - (u - f_s))) + ((f_tl + f_e) - (u - f_s)))) - u = 2 * ((f_s - (u - (u - f_s))) + ((f_tl + f_e) - (u - f_s))) and (f_w < 0) = (((f_s - (u - (u - f_s))) + ((f_tl + f_e) - (u - f_s))) < 0) then u := u + 2 * ((f_s - (u - (u - f_s))) + ((f_tl + f_e) - (u - f_s))); end if;
  elsif ar2 = 0 or u = 0 then
    u := ar2 * u + v;
  else
    u := fdlibm_fma_wide(a => ar2, b => u, c => v);
  end if;
  f_c := ((lo1 + lo2) + lo3) + lo4;
  if abs(ar3) >= 1e-144 and abs(ar3) <= 1e144 and abs(u) >= 1e-144 and abs(u) <= 1e144 and abs(f_c) <= 1e288 then
    f_p := ar3 * u;
    f_ah := (ar3 * 134217729 - (ar3 * 134217729 - ar3));
    f_bh := (u * 134217729 - (u * 134217729 - u));
    f_e := (ar3 - f_ah) * (u - f_bh) - (((f_p - f_ah * f_bh) - (ar3 - f_ah) * f_bh) - f_ah * (u - f_bh));
    f_s := f_c + f_p;
    f_tl := (f_c - (f_s - (f_s - f_c))) + (f_p - (f_s - f_c));
    f_w := (f_tl - ((f_tl + f_e) - ((f_tl + f_e) - f_tl))) + (f_e - ((f_tl + f_e) - f_tl));
    lo := f_s + (f_tl + f_e);
    if f_w <> 0 and ((f_s - (lo - (lo - f_s))) + ((f_tl + f_e) - (lo - f_s))) <> 0 and (lo + 2 * ((f_s - (lo - (lo - f_s))) + ((f_tl + f_e) - (lo - f_s)))) - lo = 2 * ((f_s - (lo - (lo - f_s))) + ((f_tl + f_e) - (lo - f_s))) and (f_w < 0) = (((f_s - (lo - (lo - f_s))) + ((f_tl + f_e) - (lo - f_s))) < 0) then lo := lo + 2 * ((f_s - (lo - (lo - f_s))) + ((f_tl + f_e) - (lo - f_s))); end if;
  elsif ar3 = 0 or u = 0 then
    lo := ar3 * u + f_c;
  else
    lo := fdlibm_fma_wide(a => ar3, b => u, c => f_c);
  end if;
  lhi := hi + lo;
  ltail := (hi - lhi) + lo;
  -- __pow: ehi + elo = y × log(x)
  ehi := y * lhi;
  f_ah := y * 134217729 - (y * 134217729 - y);
  f_bh := lhi * 134217729 - (lhi * 134217729 - lhi);
  u := (y - f_ah) * (lhi - f_bh) - (((ehi - f_ah * f_bh) - (y - f_ah) * f_bh) - f_ah * (lhi - f_bh));
  if abs(y) >= 1e-144 and abs(y) <= 1e144 and abs(ltail) >= 1e-144 and abs(ltail) <= 1e144 and abs(u) <= 1e288 then
    f_p := y * ltail;
    f_ah := (y * 134217729 - (y * 134217729 - y));
    f_bh := (ltail * 134217729 - (ltail * 134217729 - ltail));
    f_e := (y - f_ah) * (ltail - f_bh) - (((f_p - f_ah * f_bh) - (y - f_ah) * f_bh) - f_ah * (ltail - f_bh));
    f_s := u + f_p;
    f_tl := (u - (f_s - (f_s - u))) + (f_p - (f_s - u));
    f_w := (f_tl - ((f_tl + f_e) - ((f_tl + f_e) - f_tl))) + (f_e - ((f_tl + f_e) - f_tl));
    elo := f_s + (f_tl + f_e);
    if f_w <> 0 and ((f_s - (elo - (elo - f_s))) + ((f_tl + f_e) - (elo - f_s))) <> 0 and (elo + 2 * ((f_s - (elo - (elo - f_s))) + ((f_tl + f_e) - (elo - f_s)))) - elo = 2 * ((f_s - (elo - (elo - f_s))) + ((f_tl + f_e) - (elo - f_s))) and (f_w < 0) = (((f_s - (elo - (elo - f_s))) + ((f_tl + f_e) - (elo - f_s))) < 0) then elo := elo + 2 * ((f_s - (elo - (elo - f_s))) + ((f_tl + f_e) - (elo - f_s))); end if;
  elsif y = 0 or ltail = 0 then
    elo := y * ltail + u;
  else
    elo := fdlibm_fma_wide(a => y, b => ltail, c => u);
  end if;
  -- exp_inline(ehi, elo, sign_bias)
  abstop := (((int8(float8send(ehi))) >> 52) & 2047)::int;
  if abstop < 0x3C9 or abstop >= 0x408 then
    if abstop < 0x3C9 then
      one := 1 + ehi;
      return case when sign_bias then -one else one end;
    end if;
    if abstop >= 0x409 then
      if ehi < 0 then return case when sign_bias then '-0'::float8 else 0::float8 end; end if;
      return case when sign_bias then '-Infinity'::float8 else 'Infinity'::float8 end;
    end if;
    abstop := 0;
  end if;
  z := 184.6649652337873::float8 * ehi;
  kd := trunc(z);
  if abs(z - kd) >= 0.5 then kd := kd + case when z < 0 then -1 else 1 end; end if;
  ki := kd::bigint;
  if abs(kd) >= 1e-144 and abs(kd) <= 1e144 and abs((-0.005415212348111709::float8)::float8) >= 1e-144 and abs((-0.005415212348111709::float8)::float8) <= 1e144 and abs(ehi) <= 1e288 then
    f_p := kd * (-0.005415212348111709::float8)::float8;
    f_ah := (kd * 134217729 - (kd * 134217729 - kd));
    f_e := (kd - f_ah) * ((-0.005415212348111709::float8)::float8 - ((-0.005415212348111709::float8)::float8 * 134217729 - ((-0.005415212348111709::float8)::float8 * 134217729 - (-0.005415212348111709::float8)::float8))) - (((f_p - f_ah * ((-0.005415212348111709::float8)::float8 * 134217729 - ((-0.005415212348111709::float8)::float8 * 134217729 - (-0.005415212348111709::float8)::float8))) - (kd - f_ah) * ((-0.005415212348111709::float8)::float8 * 134217729 - ((-0.005415212348111709::float8)::float8 * 134217729 - (-0.005415212348111709::float8)::float8))) - f_ah * ((-0.005415212348111709::float8)::float8 - ((-0.005415212348111709::float8)::float8 * 134217729 - ((-0.005415212348111709::float8)::float8 * 134217729 - (-0.005415212348111709::float8)::float8))));
    f_s := ehi + f_p;
    f_tl := (ehi - (f_s - (f_s - ehi))) + (f_p - (f_s - ehi));
    f_w := (f_tl - ((f_tl + f_e) - ((f_tl + f_e) - f_tl))) + (f_e - ((f_tl + f_e) - f_tl));
    u := f_s + (f_tl + f_e);
    if f_w <> 0 and ((f_s - (u - (u - f_s))) + ((f_tl + f_e) - (u - f_s))) <> 0 and (u + 2 * ((f_s - (u - (u - f_s))) + ((f_tl + f_e) - (u - f_s)))) - u = 2 * ((f_s - (u - (u - f_s))) + ((f_tl + f_e) - (u - f_s))) and (f_w < 0) = (((f_s - (u - (u - f_s))) + ((f_tl + f_e) - (u - f_s))) < 0) then u := u + 2 * ((f_s - (u - (u - f_s))) + ((f_tl + f_e) - (u - f_s))); end if;
  elsif kd = 0 or (-0.005415212348111709::float8)::float8 = 0 then
    u := kd * (-0.005415212348111709::float8)::float8 + ehi;
  else
    u := fdlibm_fma_wide(a => kd, b => (-0.005415212348111709::float8)::float8, c => ehi);
  end if;
  if abs(kd) >= 1e-144 and abs(kd) <= 1e144 and abs((-1.2864023111638346e-14::float8)::float8) >= 1e-144 and abs((-1.2864023111638346e-14::float8)::float8) <= 1e144 and abs(u) <= 1e288 then
    f_p := kd * (-1.2864023111638346e-14::float8)::float8;
    f_ah := (kd * 134217729 - (kd * 134217729 - kd));
    f_e := (kd - f_ah) * ((-1.2864023111638346e-14::float8)::float8 - ((-1.2864023111638346e-14::float8)::float8 * 134217729 - ((-1.2864023111638346e-14::float8)::float8 * 134217729 - (-1.2864023111638346e-14::float8)::float8))) - (((f_p - f_ah * ((-1.2864023111638346e-14::float8)::float8 * 134217729 - ((-1.2864023111638346e-14::float8)::float8 * 134217729 - (-1.2864023111638346e-14::float8)::float8))) - (kd - f_ah) * ((-1.2864023111638346e-14::float8)::float8 * 134217729 - ((-1.2864023111638346e-14::float8)::float8 * 134217729 - (-1.2864023111638346e-14::float8)::float8))) - f_ah * ((-1.2864023111638346e-14::float8)::float8 - ((-1.2864023111638346e-14::float8)::float8 * 134217729 - ((-1.2864023111638346e-14::float8)::float8 * 134217729 - (-1.2864023111638346e-14::float8)::float8))));
    f_s := u + f_p;
    f_tl := (u - (f_s - (f_s - u))) + (f_p - (f_s - u));
    f_w := (f_tl - ((f_tl + f_e) - ((f_tl + f_e) - f_tl))) + (f_e - ((f_tl + f_e) - f_tl));
    r := f_s + (f_tl + f_e);
    if f_w <> 0 and ((f_s - (r - (r - f_s))) + ((f_tl + f_e) - (r - f_s))) <> 0 and (r + 2 * ((f_s - (r - (r - f_s))) + ((f_tl + f_e) - (r - f_s)))) - r = 2 * ((f_s - (r - (r - f_s))) + ((f_tl + f_e) - (r - f_s))) and (f_w < 0) = (((f_s - (r - (r - f_s))) + ((f_tl + f_e) - (r - f_s))) < 0) then r := r + 2 * ((f_s - (r - (r - f_s))) + ((f_tl + f_e) - (r - f_s))); end if;
  elsif kd = 0 or (-1.2864023111638346e-14::float8)::float8 = 0 then
    r := kd * (-1.2864023111638346e-14::float8)::float8 + u;
  else
    r := fdlibm_fma_wide(a => kd, b => (-1.2864023111638346e-14::float8)::float8, c => u);
  end if;
  r := r + elo;
  j := (ki & 127)::int;
  r2 := r * r;
  if abs(r) >= 1e-144 and abs(r) <= 1e144 and abs((0.008333335853059549::float8)::float8) >= 1e-144 and abs((0.008333335853059549::float8)::float8) <= 1e144 and abs((0.0416666808410674::float8)::float8) <= 1e288 then
    f_p := r * (0.008333335853059549::float8)::float8;
    f_ah := (r * 134217729 - (r * 134217729 - r));
    f_e := (r - f_ah) * ((0.008333335853059549::float8)::float8 - ((0.008333335853059549::float8)::float8 * 134217729 - ((0.008333335853059549::float8)::float8 * 134217729 - (0.008333335853059549::float8)::float8))) - (((f_p - f_ah * ((0.008333335853059549::float8)::float8 * 134217729 - ((0.008333335853059549::float8)::float8 * 134217729 - (0.008333335853059549::float8)::float8))) - (r - f_ah) * ((0.008333335853059549::float8)::float8 * 134217729 - ((0.008333335853059549::float8)::float8 * 134217729 - (0.008333335853059549::float8)::float8))) - f_ah * ((0.008333335853059549::float8)::float8 - ((0.008333335853059549::float8)::float8 * 134217729 - ((0.008333335853059549::float8)::float8 * 134217729 - (0.008333335853059549::float8)::float8))));
    f_s := (0.0416666808410674::float8)::float8 + f_p;
    f_tl := ((0.0416666808410674::float8)::float8 - (f_s - (f_s - (0.0416666808410674::float8)::float8))) + (f_p - (f_s - (0.0416666808410674::float8)::float8));
    f_w := (f_tl - ((f_tl + f_e) - ((f_tl + f_e) - f_tl))) + (f_e - ((f_tl + f_e) - f_tl));
    u := f_s + (f_tl + f_e);
    if f_w <> 0 and ((f_s - (u - (u - f_s))) + ((f_tl + f_e) - (u - f_s))) <> 0 and (u + 2 * ((f_s - (u - (u - f_s))) + ((f_tl + f_e) - (u - f_s)))) - u = 2 * ((f_s - (u - (u - f_s))) + ((f_tl + f_e) - (u - f_s))) and (f_w < 0) = (((f_s - (u - (u - f_s))) + ((f_tl + f_e) - (u - f_s))) < 0) then u := u + 2 * ((f_s - (u - (u - f_s))) + ((f_tl + f_e) - (u - f_s))); end if;
  elsif r = 0 or (0.008333335853059549::float8)::float8 = 0 then
    u := r * (0.008333335853059549::float8)::float8 + (0.0416666808410674::float8)::float8;
  else
    u := fdlibm_fma_wide(a => r, b => (0.008333335853059549::float8)::float8, c => (0.0416666808410674::float8)::float8);
  end if;
  if abs(r) >= 1e-144 and abs(r) <= 1e144 and abs((0.16666666666665886::float8)::float8) >= 1e-144 and abs((0.16666666666665886::float8)::float8) <= 1e144 and abs((0.49999999999996786::float8)::float8) <= 1e288 then
    f_p := r * (0.16666666666665886::float8)::float8;
    f_ah := (r * 134217729 - (r * 134217729 - r));
    f_e := (r - f_ah) * ((0.16666666666665886::float8)::float8 - ((0.16666666666665886::float8)::float8 * 134217729 - ((0.16666666666665886::float8)::float8 * 134217729 - (0.16666666666665886::float8)::float8))) - (((f_p - f_ah * ((0.16666666666665886::float8)::float8 * 134217729 - ((0.16666666666665886::float8)::float8 * 134217729 - (0.16666666666665886::float8)::float8))) - (r - f_ah) * ((0.16666666666665886::float8)::float8 * 134217729 - ((0.16666666666665886::float8)::float8 * 134217729 - (0.16666666666665886::float8)::float8))) - f_ah * ((0.16666666666665886::float8)::float8 - ((0.16666666666665886::float8)::float8 * 134217729 - ((0.16666666666665886::float8)::float8 * 134217729 - (0.16666666666665886::float8)::float8))));
    f_s := (0.49999999999996786::float8)::float8 + f_p;
    f_tl := ((0.49999999999996786::float8)::float8 - (f_s - (f_s - (0.49999999999996786::float8)::float8))) + (f_p - (f_s - (0.49999999999996786::float8)::float8));
    f_w := (f_tl - ((f_tl + f_e) - ((f_tl + f_e) - f_tl))) + (f_e - ((f_tl + f_e) - f_tl));
    v := f_s + (f_tl + f_e);
    if f_w <> 0 and ((f_s - (v - (v - f_s))) + ((f_tl + f_e) - (v - f_s))) <> 0 and (v + 2 * ((f_s - (v - (v - f_s))) + ((f_tl + f_e) - (v - f_s)))) - v = 2 * ((f_s - (v - (v - f_s))) + ((f_tl + f_e) - (v - f_s))) and (f_w < 0) = (((f_s - (v - (v - f_s))) + ((f_tl + f_e) - (v - f_s))) < 0) then v := v + 2 * ((f_s - (v - (v - f_s))) + ((f_tl + f_e) - (v - f_s))); end if;
  elsif r = 0 or (0.16666666666665886::float8)::float8 = 0 then
    v := r * (0.16666666666665886::float8)::float8 + (0.49999999999996786::float8)::float8;
  else
    v := fdlibm_fma_wide(a => r, b => (0.16666666666665886::float8)::float8, c => (0.49999999999996786::float8)::float8);
  end if;
  f_c := ('{0,9.447885451727066e-17,-1.507066976926039e-17,-5.679155082825012e-17,4.9997448722726326e-17,-4.823683599994895e-17,7.357846871247418e-18,5.773230223741951e-17,8.189317638195515e-17,5.326891139980878e-17,1.6665881442326747e-18,-1.128113245461828e-17,-7.402825309426177e-17,-3.578659767309563e-18,-6.170654745608695e-17,2.919139999949279e-17,-2.7939114859515733e-17,-5.399285355184285e-17,4.776959425256223e-17,-7.927701432338473e-17,9.341710609905046e-17,-5.534520675707472e-17,4.585670326662351e-17,2.8582430411116143e-17,7.826573258636076e-17,4.053626906769216e-17,2.823784425951061e-17,-7.882802262487991e-17,3.2904726646008416e-17,-1.5792094703347882e-18,4.721368121170128e-17,1.3045277096919659e-17,3.3484623336251524e-17,3.8611199774925664e-17,5.527550048505249e-17,-3.927184172445234e-17,-6.346552106729483e-17,-8.684417614865944e-17,-1.5456342819397733e-17,-8.70763476495455e-17,3.750854201303127e-17,-6.616854503526488e-17,-5.346099009198751e-18,-2.443726321015018e-17,2.1023049675215714e-18,7.771067937501065e-17,1.3357510088834541e-17,6.938291696959204e-17,1.9572585293112036e-17,6.632256961675804e-17,-5.478069123926778e-17,-4.140839310392624e-17,-2.1571477251208752e-17,-3.8287766552120535e-17,6.663804589232195e-17,2.3936187400285282e-17,5.68648095791174e-17,1.1264523354521684e-18,7.007875046906994e-17,-5.0119214278381254e-17,-4.8923067513522756e-17,-3.5260089953269434e-17,-6.872303720902018e-17,5.001446664133532e-18,-6.835808657661922e-17,-1.1307344092910212e-17,-8.416011634717156e-18,-2.9247977035436566e-17,-2.092304381843353e-17,-3.9778645875427124e-17,-3.833464968654295e-17,5.763611164480894e-17,-2.3591094770850053e-17,7.260074661098575e-17,9.50689710108796e-18,-4.272956133839906e-17,-6.735219232374683e-17,-2.8396044410430936e-17,-7.226635472101257e-17,5.786121003395918e-17,5.1548301170786783e-17,-9.416257568878152e-18,2.4253985766689806e-17,-6.604314051707707e-17,-6.432131775424189e-18,-1.2204007601863921e-17,-6.336161863401293e-17,-3.7800879246373815e-17,1.5341410053603723e-17,1.2932855580427452e-17,-4.123367330661149e-17,4.703083974463456e-17,-6.152602891550265e-17,5.827849326195279e-17,3.540948262646183e-17,-3.2741571320938764e-17,4.875160526227062e-17,-5.718569790077838e-17,-4.719539664590972e-18,-5.773451958805706e-17,-1.0772487078934056e-17,-6.221808618533911e-17,1.821405440362259e-17,-6.155536546227639e-17,1.685487290628973e-17,5.3581249177694816e-17,3.621615935336894e-17,8.588379527574144e-18,1.01562190116415e-17,-2.869134889187244e-17,-5.495118966122005e-17,-5.56965572431627e-17,1.790126907604513e-17,-3.2211766346200164e-17,5.265370768556274e-17,3.5089866402403033e-17,-3.266924100901318e-17,-4.3657593008079375e-17,1.7963932659833022e-17,3.4300925275214166e-17,-5.545065618639427e-17,-5.149009745457733e-17,5.336805878514151e-17,3.498978661192973e-17,4.5784915277060095e-17,-5.241934575393899e-17,2.0414278897578303e-17,4.124842848606488e-18}'::float8[])[j + 1] + r;
  if abs(r2) >= 1e-144 and abs(r2) <= 1e144 and abs(v) >= 1e-144 and abs(v) <= 1e144 and abs(f_c) <= 1e288 then
    f_p := r2 * v;
    f_ah := (r2 * 134217729 - (r2 * 134217729 - r2));
    f_bh := (v * 134217729 - (v * 134217729 - v));
    f_e := (r2 - f_ah) * (v - f_bh) - (((f_p - f_ah * f_bh) - (r2 - f_ah) * f_bh) - f_ah * (v - f_bh));
    f_s := f_c + f_p;
    f_tl := (f_c - (f_s - (f_s - f_c))) + (f_p - (f_s - f_c));
    f_w := (f_tl - ((f_tl + f_e) - ((f_tl + f_e) - f_tl))) + (f_e - ((f_tl + f_e) - f_tl));
    v := f_s + (f_tl + f_e);
    if f_w <> 0 and ((f_s - (v - (v - f_s))) + ((f_tl + f_e) - (v - f_s))) <> 0 and (v + 2 * ((f_s - (v - (v - f_s))) + ((f_tl + f_e) - (v - f_s)))) - v = 2 * ((f_s - (v - (v - f_s))) + ((f_tl + f_e) - (v - f_s))) and (f_w < 0) = (((f_s - (v - (v - f_s))) + ((f_tl + f_e) - (v - f_s))) < 0) then v := v + 2 * ((f_s - (v - (v - f_s))) + ((f_tl + f_e) - (v - f_s))); end if;
  elsif r2 = 0 or v = 0 then
    v := r2 * v + f_c;
  else
    v := fdlibm_fma_wide(a => r2, b => v, c => f_c);
  end if;
  f_a := r2 * r2;
  if abs(f_a) >= 1e-144 and abs(f_a) <= 1e144 and abs(u) >= 1e-144 and abs(u) <= 1e144 and abs(v) <= 1e288 then
    f_p := f_a * u;
    f_ah := (f_a * 134217729 - (f_a * 134217729 - f_a));
    f_bh := (u * 134217729 - (u * 134217729 - u));
    f_e := (f_a - f_ah) * (u - f_bh) - (((f_p - f_ah * f_bh) - (f_a - f_ah) * f_bh) - f_ah * (u - f_bh));
    f_s := v + f_p;
    f_tl := (v - (f_s - (f_s - v))) + (f_p - (f_s - v));
    f_w := (f_tl - ((f_tl + f_e) - ((f_tl + f_e) - f_tl))) + (f_e - ((f_tl + f_e) - f_tl));
    e := f_s + (f_tl + f_e);
    if f_w <> 0 and ((f_s - (e - (e - f_s))) + ((f_tl + f_e) - (e - f_s))) <> 0 and (e + 2 * ((f_s - (e - (e - f_s))) + ((f_tl + f_e) - (e - f_s)))) - e = 2 * ((f_s - (e - (e - f_s))) + ((f_tl + f_e) - (e - f_s))) and (f_w < 0) = (((f_s - (e - (e - f_s))) + ((f_tl + f_e) - (e - f_s))) < 0) then e := e + 2 * ((f_s - (e - (e - f_s))) + ((f_tl + f_e) - (e - f_s))); end if;
  elsif f_a = 0 or u = 0 then
    e := f_a * u + v;
  else
    e := fdlibm_fma_wide(a => f_a, b => u, c => v);
  end if;
  scale := ('{1,1.0054299011128027,1.0108892860517005,1.016378314910953,1.0218971486541166,1.0274459491187637,1.0330248790212284,1.0386341019613787,1.0442737824274138,1.0499440858006872,1.0556451783605572,1.061377227289262,1.0671404006768237,1.0729348675259756,1.0787607977571199,1.0846183622133092,1.0905077326652577,1.0964290818163769,1.102382583307841,1.1083684117236787,1.1143867425958924,1.1204377524096067,1.1265216186082418,1.1326385195987192,1.1387886347566916,1.1449721444318042,1.1511892299529827,1.1574400736337511,1.1637248587775775,1.1700437696832502,1.1763969916502812,1.182784710984341,1.189207115002721,1.1956643920398273,1.202156731452703,1.2086843236265816,1.215247359980469,1.2218460329727576,1.22848053610687,1.2351510639369334,1.241857812073484,1.2486009771892048,1.255380757024691,1.2621973503942507,1.2690509571917332,1.275941778396392,1.2828700160787783,1.2898358734066657,1.2968395546510096,1.3038812651919358,1.3109612115247644,1.318079601266064,1.3252366431597413,1.3324325470831615,1.339667524053303,1.3469417862329458,1.3542555469368927,1.3616090206382248,1.3690024229745905,1.3764359707545302,1.383909881963832,1.3914243757719262,1.3989796725383112,1.4065759938190154,1.4142135623730951,1.4218926021691656,1.42961333839197,1.4373759974489824,1.4451808069770467,1.4530279958490526,1.460917794180647,1.4688504333369818,1.4768261459394993,1.4848451658727524,1.4929077282912648,1.5010140696264256,1.5091644275934228,1.5173590411982147,1.5255981507445384,1.533881997840956,1.5422108254079407,1.550584877685,1.559004400237837,1.567469639965553,1.5759808451078865,1.5845382652524937,1.593142151342267,1.6017927556826934,1.6104903319492543,1.6192351351948637,1.6280274218573478,1.6368674497669644,1.645755478153965,1.6546917676561943,1.6636765803267364,1.6727101796415966,1.681792830507429,1.6909247992693053,1.7001063537185235,1.709337763100463,1.718619298122478,1.7279512309618377,1.7373338352737062,1.746767386199169,1.7562521603732995,1.7657884359332727,1.7753764925265212,1.785016611318935,1.7947090750031072,1.804454167806624,1.8142521755003989,1.8241033854070534,1.8340080864093424,1.843966568958626,1.8539791250833855,1.864046048397789,1.8741676341103,1.8843441790323345,1.8945759815869656,1.9048633418176741,1.9152065613971474,1.925605943636125,1.9360617934922943,1.9465744175792332,1.9571441241754002,1.9677712232331759,1.978456026387951,1.9891988469672663}'::float8[])[j + 1];
  if sign_bias then scale := -scale; end if;
  if abstop <> 0 then
    scale := scale * (('{2.2250738585072014e-308,4.1045368012983762e-289,7.571533991467358e-270,1.3967014978599092e-250,2.5764595078388533e-231,4.7527289157379e-212,8.767237396033612e-193,1.617269844780878e-173,2.983336292480083e-154,5.503284107318959e-135,1.0151767349262597e-115,1.8726705418768793e-96,3.454467422037778e-77,6.372367644529809e-58,1.1754943508222875e-38,2.168404344971009e-19,4,73786976294838210000,1.361129467683754e+39,2.5108406941546723e+58,4.631683569492648e+77,8.54394814368364e+96,1.5760802478557792e+116,2.9073548971824276e+135,5.363123171977039e+154,9.893216058924181e+173,1.824976247048878e+193,3.366486976990959e+212,6.210072369202836e+231,1.1455561567389984e+251,2.113178124542661e+270,3.89812560456e+289}'::float8[])[((((ki >> 7)::int) + 1022) >> 6) + 1] * ('{1,2,4,8,16,32,64,128,256,512,1024,2048,4096,8192,16384,32768,65536,131072,262144,524288,1048576,2097152,4194304,8388608,16777216,33554432,67108864,134217728,268435456,536870912,1073741824,2147483648,4294967296,8589934592,17179869184,34359738368,68719476736,137438953472,274877906944,549755813888,1099511627776,2199023255552,4398046511104,8796093022208,17592186044416,35184372088832,70368744177664,140737488355328,281474976710656,562949953421312,1125899906842624,2251799813685248,4503599627370496,9007199254740992,18014398509481984,36028797018963970,72057594037927940,144115188075855870,288230376151711740,576460752303423500,1152921504606847000,2305843009213694000,4611686018427388000,9223372036854776000}'::float8[])[((((ki >> 7)::int) + 1022) & 63) + 1]);
    if abs(scale) >= 1e-144 and abs(scale) <= 1e144 and abs(e) >= 1e-144 and abs(e) <= 1e144 and abs(scale) <= 1e288 then
      f_p := scale * e;
      f_ah := (scale * 134217729 - (scale * 134217729 - scale));
      f_bh := (e * 134217729 - (e * 134217729 - e));
      f_e := (scale - f_ah) * (e - f_bh) - (((f_p - f_ah * f_bh) - (scale - f_ah) * f_bh) - f_ah * (e - f_bh));
      f_s := scale + f_p;
      f_tl := (scale - (f_s - (f_s - scale))) + (f_p - (f_s - scale));
      f_w := (f_tl - ((f_tl + f_e) - ((f_tl + f_e) - f_tl))) + (f_e - ((f_tl + f_e) - f_tl));
      u := f_s + (f_tl + f_e);
      if f_w <> 0 and ((f_s - (u - (u - f_s))) + ((f_tl + f_e) - (u - f_s))) <> 0 and (u + 2 * ((f_s - (u - (u - f_s))) + ((f_tl + f_e) - (u - f_s)))) - u = 2 * ((f_s - (u - (u - f_s))) + ((f_tl + f_e) - (u - f_s))) and (f_w < 0) = (((f_s - (u - (u - f_s))) + ((f_tl + f_e) - (u - f_s))) < 0) then u := u + 2 * ((f_s - (u - (u - f_s))) + ((f_tl + f_e) - (u - f_s))); end if;
    elsif scale = 0 or e = 0 then
      u := scale * e + scale;
    else
      u := fdlibm_fma_wide(a => scale, b => e, c => scale);
    end if;
    return u;
  end if;
  -- specialcase(tmp, sbits, ki)
  if ki >= 0 then
    scale := scale * (('{2.2250738585072014e-308,4.1045368012983762e-289,7.571533991467358e-270,1.3967014978599092e-250,2.5764595078388533e-231,4.7527289157379e-212,8.767237396033612e-193,1.617269844780878e-173,2.983336292480083e-154,5.503284107318959e-135,1.0151767349262597e-115,1.8726705418768793e-96,3.454467422037778e-77,6.372367644529809e-58,1.1754943508222875e-38,2.168404344971009e-19,4,73786976294838210000,1.361129467683754e+39,2.5108406941546723e+58,4.631683569492648e+77,8.54394814368364e+96,1.5760802478557792e+116,2.9073548971824276e+135,5.363123171977039e+154,9.893216058924181e+173,1.824976247048878e+193,3.366486976990959e+212,6.210072369202836e+231,1.1455561567389984e+251,2.113178124542661e+270,3.89812560456e+289}'::float8[])[((((ki >> 7)::int - 1009) + 1022) >> 6) + 1] * ('{1,2,4,8,16,32,64,128,256,512,1024,2048,4096,8192,16384,32768,65536,131072,262144,524288,1048576,2097152,4194304,8388608,16777216,33554432,67108864,134217728,268435456,536870912,1073741824,2147483648,4294967296,8589934592,17179869184,34359738368,68719476736,137438953472,274877906944,549755813888,1099511627776,2199023255552,4398046511104,8796093022208,17592186044416,35184372088832,70368744177664,140737488355328,281474976710656,562949953421312,1125899906842624,2251799813685248,4503599627370496,9007199254740992,18014398509481984,36028797018963970,72057594037927940,144115188075855870,288230376151711740,576460752303423500,1152921504606847000,2305843009213694000,4611686018427388000,9223372036854776000}'::float8[])[((((ki >> 7)::int - 1009) + 1022) & 63) + 1]);
    if abs(scale) >= 1e-144 and abs(scale) <= 1e144 and abs(e) >= 1e-144 and abs(e) <= 1e144 and abs(scale) <= 1e288 then
      f_p := scale * e;
      f_ah := (scale * 134217729 - (scale * 134217729 - scale));
      f_bh := (e * 134217729 - (e * 134217729 - e));
      f_e := (scale - f_ah) * (e - f_bh) - (((f_p - f_ah * f_bh) - (scale - f_ah) * f_bh) - f_ah * (e - f_bh));
      f_s := scale + f_p;
      f_tl := (scale - (f_s - (f_s - scale))) + (f_p - (f_s - scale));
      f_w := (f_tl - ((f_tl + f_e) - ((f_tl + f_e) - f_tl))) + (f_e - ((f_tl + f_e) - f_tl));
      ey := f_s + (f_tl + f_e);
      if f_w <> 0 and ((f_s - (ey - (ey - f_s))) + ((f_tl + f_e) - (ey - f_s))) <> 0 and (ey + 2 * ((f_s - (ey - (ey - f_s))) + ((f_tl + f_e) - (ey - f_s)))) - ey = 2 * ((f_s - (ey - (ey - f_s))) + ((f_tl + f_e) - (ey - f_s))) and (f_w < 0) = (((f_s - (ey - (ey - f_s))) + ((f_tl + f_e) - (ey - f_s))) < 0) then ey := ey + 2 * ((f_s - (ey - (ey - f_s))) + ((f_tl + f_e) - (ey - f_s))); end if;
    elsif scale = 0 or e = 0 then
      ey := scale * e + scale;
    else
      ey := fdlibm_fma_wide(a => scale, b => e, c => scale);
    end if;
    if abs(ey) >= 32768 then return case when ey < 0 then '-Infinity'::float8 else 'Infinity'::float8 end; end if;
    return ey * (('{2.2250738585072014e-308,4.1045368012983762e-289,7.571533991467358e-270,1.3967014978599092e-250,2.5764595078388533e-231,4.7527289157379e-212,8.767237396033612e-193,1.617269844780878e-173,2.983336292480083e-154,5.503284107318959e-135,1.0151767349262597e-115,1.8726705418768793e-96,3.454467422037778e-77,6.372367644529809e-58,1.1754943508222875e-38,2.168404344971009e-19,4,73786976294838210000,1.361129467683754e+39,2.5108406941546723e+58,4.631683569492648e+77,8.54394814368364e+96,1.5760802478557792e+116,2.9073548971824276e+135,5.363123171977039e+154,9.893216058924181e+173,1.824976247048878e+193,3.366486976990959e+212,6.210072369202836e+231,1.1455561567389984e+251,2.113178124542661e+270,3.89812560456e+289}'::float8[])[(((1009) + 1022) >> 6) + 1] * ('{1,2,4,8,16,32,64,128,256,512,1024,2048,4096,8192,16384,32768,65536,131072,262144,524288,1048576,2097152,4194304,8388608,16777216,33554432,67108864,134217728,268435456,536870912,1073741824,2147483648,4294967296,8589934592,17179869184,34359738368,68719476736,137438953472,274877906944,549755813888,1099511627776,2199023255552,4398046511104,8796093022208,17592186044416,35184372088832,70368744177664,140737488355328,281474976710656,562949953421312,1125899906842624,2251799813685248,4503599627370496,9007199254740992,18014398509481984,36028797018963970,72057594037927940,144115188075855870,288230376151711740,576460752303423500,1152921504606847000,2305843009213694000,4611686018427388000,9223372036854776000}'::float8[])[(((1009) + 1022) & 63) + 1]);
  end if;
  scale := scale * (('{2.2250738585072014e-308,4.1045368012983762e-289,7.571533991467358e-270,1.3967014978599092e-250,2.5764595078388533e-231,4.7527289157379e-212,8.767237396033612e-193,1.617269844780878e-173,2.983336292480083e-154,5.503284107318959e-135,1.0151767349262597e-115,1.8726705418768793e-96,3.454467422037778e-77,6.372367644529809e-58,1.1754943508222875e-38,2.168404344971009e-19,4,73786976294838210000,1.361129467683754e+39,2.5108406941546723e+58,4.631683569492648e+77,8.54394814368364e+96,1.5760802478557792e+116,2.9073548971824276e+135,5.363123171977039e+154,9.893216058924181e+173,1.824976247048878e+193,3.366486976990959e+212,6.210072369202836e+231,1.1455561567389984e+251,2.113178124542661e+270,3.89812560456e+289}'::float8[])[((((ki >> 7)::int + 1022) + 1022) >> 6) + 1] * ('{1,2,4,8,16,32,64,128,256,512,1024,2048,4096,8192,16384,32768,65536,131072,262144,524288,1048576,2097152,4194304,8388608,16777216,33554432,67108864,134217728,268435456,536870912,1073741824,2147483648,4294967296,8589934592,17179869184,34359738368,68719476736,137438953472,274877906944,549755813888,1099511627776,2199023255552,4398046511104,8796093022208,17592186044416,35184372088832,70368744177664,140737488355328,281474976710656,562949953421312,1125899906842624,2251799813685248,4503599627370496,9007199254740992,18014398509481984,36028797018963970,72057594037927940,144115188075855870,288230376151711740,576460752303423500,1152921504606847000,2305843009213694000,4611686018427388000,9223372036854776000}'::float8[])[((((ki >> 7)::int + 1022) + 1022) & 63) + 1]);
  t1 := scale * e;
  ey := scale + t1;
  if abs(ey) < 1 then
    one := case when ey < 0 then -1 else 1 end;
    lo := (scale - ey) + t1;
    hi := one + ey;
    lo := ((one - hi) + ey) + lo;
    ey := (hi + lo) - one;
    if ey = 0 then ey := case when sign_bias then '-0'::float8 else 0::float8 end; end if;
  end if;
  return ey * 2.2250738585072014e-308;
end $$;
