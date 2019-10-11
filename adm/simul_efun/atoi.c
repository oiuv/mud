// atoi.c

int atoi(string str)
{
    int v;

    if (! stringp(str) || ! sscanf(str, "%d", v))
        return 0;

    return v;
}
