#include <ansi.h>
inherit CORE_CLEAN_UP;

int main(object me, string arg)
{
    int *rgb = ({0x00, 0x33, 0x66, 0x99, 0xcc, 0xff});

    if (!arg || arg == "ansi")
    {
        printf("ANSI颜色测试：\n");
        for (int i = 30; i < 50; i++)
        {
            printf(SGR(i) "%d. 你好ABC" NOR, i);
            if (i % 5)
            {
                write("\t");
            }
            else
            {
                write("\n");
            }
        }
        write("\n");
    }

    if (!arg || arg == "256")
    {
        printf("256颜色测试：\n");
        for (int i = 0; i < 256; i++)
        {
            printf(FCC(i) "%3d. 你好ABC" NOR, i);
            if (i % 5)
            {
                write("\t");
            }
            else
            {
                write("\n");
            }
        }
    }

    if (!arg || arg == "rgb")
    {
        printf("RGB颜色测试：\n");
        for (int r = 0; r < sizeof(rgb); r++)
        {
            for (int g = 0; g < sizeof(rgb); g++)
            {
                for (int b = 0; b < sizeof(rgb); b++)
                {
                    printf(RGB(rgb[r], rgb[g], rgb[b]) "%'0'2x%'0'2x%'0'2x\t" NOR, rgb[r], rgb[g], rgb[b]);
                }
                write("\n");
            }
            write("\n");
        }
    }

    return 1;
}

int help(object me)
{
    write(@HELP
指令格式 : colors [ansi|256|rgb]

这个指令可以测试客户端支持的颜色模式。

HELP
    );
    return 1;
}
