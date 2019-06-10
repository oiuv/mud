// Ä£Äâ fluffos ĞÂÔö efun
#ifndef FLUFFOS

mixed abs(mixed n)
{
    if (!floatp(n) && !intp(n))
        return 0;

    return (n < 0) ? -n : n;
}

mixed element_of(mixed *arr)
{
    return arr[random(sizeof(arr))];
}

#endif
