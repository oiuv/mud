// unicode字符
inherit CORE_CLEAN_UP;

int main(object me, string arg)
{
    int x;

    if (arg && arg[0..1] == "0x")
    {
        sscanf(arg, "%x", x);
    }
    else if (arg == "emoji")
    {
        int i;
        x = 0x1f300;

        for (i = 0; i < 16; i++)
        {
            printf("\t %X", i);
        }
        for (i = 0; i < 976; i++)
        {
            if (i % 16 == 0)
            {
                printf("\n%X\t", x);
            }
            printf("%c\t", x);
            x++;
        }
        write("\n");
        for (i = 0; i < 16; i++)
        {
            printf("\t %X", i);
        }
        write("\n");
    }
    else
    {
        x = atoi(arg);
    }

    if (x < 1 || x > 1114109)
    {
        for (int i = 32; i < 127; i++)
        {
            printf("%d(%X) = %c\n", i, i, i);
        }
    }
    else
    {
        catch(printf("%d(%X) = %c\n", x, x, x));
    }

    return 1;
}

int help(object me)
{
    if (!wizardp(me))
        return 0;

    write(@TEXT
指令格式: unicode [code]
指令说明:
    显示指定编码的 unicode 字符，code 为字符的十进制编码(范围：1~1114109)，或者十六进制编码(范围：0x1~0x10FFFD)。
    如：unicode 128050 或 unicode 0x1F495
    使用 unicode emoji 可列出常用emoji表情💕
TEXT
    );
    return 1;
}
