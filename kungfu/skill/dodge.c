// dodge.c

inherit SKILL;

string *dodge_msg = ({
        "但是和$p$l偏了几寸。\n",
        "但是被$p机灵地躲开了。\n",
        "但是$n身子一侧，闪了开去。\n",
        "但是被$p及时避开。\n",
        "但是$n已有准备，不慌不忙的躲开。\n",
});

string query_dodge_msg()
{
        return dodge_msg[random(sizeof(dodge_msg))];
}
