// atoi.c

int atoi(string str)
{
        int v;

        if (! stringp(str) || ! sscanf(str, "%d", v))
                return 0;

	return v;
}

//新增求绝对值 by 薪有所属
mixed abs(mixed n)
{

        if (! floatp(n) && ! intp(n))
                return 0;

        return (n < 0)? -n : n;

}