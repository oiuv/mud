// yufu.c
// Date: YZC 96/01/19
#include <ansi.h>

inherit KNOWER;

void create()
{
    set_name("渔夫", ({ "yu fu" }) );
    set("nickname", HIC "消息灵通" NOR);
    set("gender", "男性" );
    set("age", 62);
    set("long", @LONG
这是一个饱受风霜的老渔夫，虽然不是江湖人士，但是多年在此却也
和不少武林人士打过交道，知道不少消息秘闻。
LONG );
    setup();
}
