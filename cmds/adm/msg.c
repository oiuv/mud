#include <ansi.h>

inherit F_CLEAN_UP;

int main(object me, string arg)
{
    if (!wizardp(me) || wiz_level(me) < 5)
        return 0;

    if (!arg)
        return 0;

    message("warning", BRED "【系统提示】" + arg + NOR "\n", users(), 0);

    return 1;
}
