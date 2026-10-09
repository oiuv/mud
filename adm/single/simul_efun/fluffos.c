// 模拟 fluffos 新增 efun
#ifndef FLUFFOS

mixed abs(mixed n) {
    if (!floatp(n) && !intp(n))
        return 0;

    return (n < 0) ? -n : n;
}

mixed element_of(mixed *arr) {
    return arr[random(sizeof(arr))];
}

#endif

#ifndef __PACKAGE_TRIM__
// 去掉str两端的空格
string trim(string str) {
    int len;

    while (str[0] == ' ')
        str = str[1..<1];
    while ((len = strlen(str) - 1) >= 0 && str[len] == ' ')
        str = str[0..<2];

    return str;
}

// 去掉str左端空格
string ltrim(string arg) {
    for (int i = 0; i < strlen(arg); i++)
        if (arg[i..i] != " ")
            return arg[i..strlen(arg)];
    return "";
}
#endif

// Native hash() remains untouched. The fallback implements RFC 1321 MD5 and
// FIPS 180-4 SHA-256 over UTF-8 bytes, including embedded NULs.
#if !efun_defined(hash)

private int *hash_sha256_constants = ({
    0x428a2f98, 0x71374491, 0xb5c0fbcf, 0xe9b5dba5,
    0x3956c25b, 0x59f111f1, 0x923f82a4, 0xab1c5ed5,
    0xd807aa98, 0x12835b01, 0x243185be, 0x550c7dc3,
    0x72be5d74, 0x80deb1fe, 0x9bdc06a7, 0xc19bf174,
    0xe49b69c1, 0xefbe4786, 0x0fc19dc6, 0x240ca1cc,
    0x2de92c6f, 0x4a7484aa, 0x5cb0a9dc, 0x76f988da,
    0x983e5152, 0xa831c66d, 0xb00327c8, 0xbf597fc7,
    0xc6e00bf3, 0xd5a79147, 0x06ca6351, 0x14292967,
    0x27b70a85, 0x2e1b2138, 0x4d2c6dfc, 0x53380d13,
    0x650a7354, 0x766a0abb, 0x81c2c92e, 0x92722c85,
    0xa2bfe8a1, 0xa81a664b, 0xc24b8b70, 0xc76c51a3,
    0xd192e819, 0xd6990624, 0xf40e3585, 0x106aa070,
    0x19a4c116, 0x1e376c08, 0x2748774c, 0x34b0bcb5,
    0x391c0cb3, 0x4ed8aa4a, 0x5b9cca4f, 0x682e6ff3,
    0x748f82ee, 0x78a5636f, 0x84c87814, 0x8cc70208,
    0x90befffa, 0xa4506ceb, 0xbef9a3f7, 0xc67178f2
});

private int *hash_md5_constants = ({
    0xd76aa478, 0xe8c7b756, 0x242070db, 0xc1bdceee,
    0xf57c0faf, 0x4787c62a, 0xa8304613, 0xfd469501,
    0x698098d8, 0x8b44f7af, 0xffff5bb1, 0x895cd7be,
    0x6b901122, 0xfd987193, 0xa679438e, 0x49b40821,
    0xf61e2562, 0xc040b340, 0x265e5a51, 0xe9b6c7aa,
    0xd62f105d, 0x02441453, 0xd8a1e681, 0xe7d3fbc8,
    0x21e1cde6, 0xc33707d6, 0xf4d50d87, 0x455a14ed,
    0xa9e3e905, 0xfcefa3f8, 0x676f02d9, 0x8d2a4c8a,
    0xfffa3942, 0x8771f681, 0x6d9d6122, 0xfde5380c,
    0xa4beea44, 0x4bdecfa9, 0xf6bb4b60, 0xbebfbc70,
    0x289b7ec6, 0xeaa127fa, 0xd4ef3085, 0x04881d05,
    0xd9d4d039, 0xe6db99e5, 0x1fa27cf8, 0xc4ac5665,
    0xf4292244, 0x432aff97, 0xab9423a7, 0xfc93a039,
    0x655b59c3, 0x8f0ccc92, 0xffeff47d, 0x85845dd1,
    0x6fa87e4f, 0xfe2ce6e0, 0xa3014314, 0x4e0811a1,
    0xf7537e82, 0xbd3af235, 0x2ad7d2bb, 0xeb86d391
});

private int *hash_md5_shifts = ({
    7, 12, 17, 22, 5, 9, 14, 20, 4, 11, 16, 23, 6, 10, 15, 21
});

// FluffOS ints are 64-bit; mask after additions and rotations to get uint32.
private int hash_rotate_right(int value, int bits) {
    return ((value >> bits) | (value << (32 - bits))) & 0xffffffff;
}

private buffer hash_padded_bytes(string text, int little_endian) {
    buffer bytes, padded;
    int length, size, i, bits;

    bytes = string_encode(text, "UTF-8");
    length = sizeof(bytes);
    size = ((length + 72) / 64) * 64;
    padded = allocate_buffer(size);
    if (length) write_buffer(padded, 0, bytes);
    padded[length] = 0x80;
    bits = length * 8;
    for (i = 0; i < 8; i++)
        padded[size - 8 + (little_endian ? i : 7 - i)] = (bits >> (8 * i)) & 255;
    return padded;
}

private string hash_sha256(string text) {
    buffer bytes;
    int *state, *words;
    int offset, i, pos, s0, s1, t1, t2;
    int a, b, c, d, e, f, g, h;
    string result;

    bytes = hash_padded_bytes(text, 0);
    state = ({ 0x6a09e667, 0xbb67ae85, 0x3c6ef372, 0xa54ff53a,
        0x510e527f, 0x9b05688c, 0x1f83d9ab, 0x5be0cd19 });
    words = allocate(64);
    for (offset = 0; offset < sizeof(bytes); offset += 64) {
        for (i = 0; i < 16; i++) {
            pos = offset + i * 4;
            words[i] = (bytes[pos] << 24) | (bytes[pos + 1] << 16) | (bytes[pos + 2] << 8) | bytes[pos + 3];
        }
        for (i = 16; i < 64; i++) {
            s0 = hash_rotate_right(
                words[i - 15],
                7
            ) ^ hash_rotate_right(words[i - 15], 18) ^ (words[i - 15] >> 3);
            s1 = hash_rotate_right(
                words[i - 2],
                17
            ) ^ hash_rotate_right(words[i - 2], 19) ^ (words[i - 2] >> 10);
            words[i] = (words[i - 16] + s0 + words[i - 7] + s1) & 0xffffffff;
        }
        a = state[0]; b = state[1]; c = state[2]; d = state[3];
        e = state[4]; f = state[5]; g = state[6]; h = state[7];
        for (i = 0; i < 64; i++) {
            s1 = hash_rotate_right(e, 6) ^ hash_rotate_right(e, 11) ^ hash_rotate_right(e, 25);
            t1 = (h + s1 + ((e & f) ^ (~e & g)) + hash_sha256_constants[i] + words[i]) & 0xffffffff;
            s0 = hash_rotate_right(a, 2) ^ hash_rotate_right(a, 13) ^ hash_rotate_right(a, 22);
            t2 = (s0 + ((a & b) ^ (a & c) ^ (b & c))) & 0xffffffff;
            h = g; g = f; f = e; e = (d + t1) & 0xffffffff;
            d = c; c = b; b = a; a = (t1 + t2) & 0xffffffff;
        }
        state[0] = (state[0] + a) & 0xffffffff;
        state[1] = (state[1] + b) & 0xffffffff;
        state[2] = (state[2] + c) & 0xffffffff;
        state[3] = (state[3] + d) & 0xffffffff;
        state[4] = (state[4] + e) & 0xffffffff;
        state[5] = (state[5] + f) & 0xffffffff;
        state[6] = (state[6] + g) & 0xffffffff;
        state[7] = (state[7] + h) & 0xffffffff;
    }
    result = "";
    foreach (i in state) result += sprintf("%08x", i);
    return result;
}

private string hash_md5(string text) {
    buffer bytes;
    int *state, *words;
    int offset, i, pos, f, g, next, shift;
    int a, b, c, d;
    string result;

    bytes = hash_padded_bytes(text, 1);
    state = ({ 0x67452301, 0xefcdab89, 0x98badcfe, 0x10325476 });
    words = allocate(16);
    for (offset = 0; offset < sizeof(bytes); offset += 64) {
        for (i = 0; i < 16; i++) {
            pos = offset + i * 4;
            words[i] = bytes[pos] | (bytes[pos + 1] << 8) | (bytes[pos + 2] << 16) | (bytes[pos + 3] << 24);
        }
        a = state[0]; b = state[1]; c = state[2]; d = state[3];
        for (i = 0; i < 64; i++) {
            if (i < 16) {
                f = (b & c) | (~b & d); g = i;
            } else if (i < 32) {
                f = (d & b) | (~d & c); g = (5 * i + 1) % 16;
            } else if (i < 48) {
                f = b ^ c ^ d; g = (3 * i + 5) % 16;
            } else {
                f = c ^ (b | ~d); g = (7 * i) % 16;
            }
            next = (a + f + hash_md5_constants[i] + words[g]) & 0xffffffff;
            shift = hash_md5_shifts[(i / 16) * 4 + i % 4];
            a = d; d = c; c = b;
            b = (b + hash_rotate_right(next, 32 - shift)) & 0xffffffff;
        }
        state[0] = (state[0] + a) & 0xffffffff;
        state[1] = (state[1] + b) & 0xffffffff;
        state[2] = (state[2] + c) & 0xffffffff;
        state[3] = (state[3] + d) & 0xffffffff;
    }
    result = "";
    foreach (i in state)
        result += sprintf("%02x%02x%02x%02x", i & 255, (i >> 8) & 255,
            (i >> 16) & 255, (i >> 24) & 255);
    return result;
}

string hash(string algorithm, string text) {
    if (!stringp(algorithm) || !stringp(text)) error("hash(): expected two strings.\n");
    switch (lower_case(algorithm)) {
        case "md5": return hash_md5(text);
        case "sha256": return hash_sha256(text);
        default: error("hash(): algorithm requires driver PACKAGE_CRYPTO: " + algorithm + ".\n");
    }
}

#endif
