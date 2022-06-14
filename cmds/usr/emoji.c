// emoji.c

int main(object me, string arg)
{
    int x = 0x1f300;
    int i;

    if (query_encoding() != "utf-8")
    {
        return notify_fail("你的客户端编码不是UTF-8，无法显示emoji表情。\n");
    }

    for (i = 0; i < 16; i++)
    {
        printf("\t%x", i);
    }
    for (i = 0; i < 976; i++)
    {
        if (i % 16 == 0)
        {
            printf("\n%x\t", x);
        }
        printf("%c\t", x);
        x++;
    }
    write("\n");
    for (i = 0; i < 16; i++)
    {
        printf("\t%x", i);
    }
    write("\n");

    return 1;
}

int help(object me)
{
    write(@HELP
指令格式 : emoji

显示常用的emoji表情符号，仅在utf-8编码下可用。
HELP );
    return 1;
}
