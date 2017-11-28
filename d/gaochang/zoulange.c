#include <ansi.h>
inherit ROOM;

string look_wall();

void create()
{
        set("short", "走廊");
        set("long", @LONG
这里是后殿走廊。房顶一侧支在南面的高墙上，另一侧则
与北边般若堂的屋顶相连。彩梁画栋，连顶棚也用彩漆绘满了
各种飞天的图形，每幅画似乎都在诉说一个娓娓动人的佛经故
事。南边墙(wall)上题着一个字。
LONG);
        set("exits", ([
                "northwest" : __DIR__"zoulang2",
                "southwest" : __DIR__"eroom3",
        ]));
        set("maze", 1);
        set("item_desc",([
                "wall" : (: look_wall :),
        ]));
        setup();
        //replace_program(ROOM);
}

string look_wall()
{
        return WHT "\n\n"
"       风风风风风风风风风风风风风风风风风风风\n"
"       风风风风风                  风风风风风\n"
"       风风风风风  风风风风风风风  风风风风风\n"
"       风风风风风  风  风风风  风  风风风风风\n"
"       风风风风风  风风  风  风风  风风风风风\n"
"       风风风风风  风风风  风风风  风风风风风\n"
"       风风风风风  风风  风  风风  风风风风风\n"
"       风风风风风  风  风风风  风  风风风风风\n"
"       风风风风风  风风风风风风风  风风风风风\n"
"       风风风风  风风风风风风风风风  风风风风\n"
"       风风风  风风风风风风风风风风风  风风风\n"
"       风风风风风风风风风风风风风风风风风风风\n"
"       风风风风风风风风风风风风风风风风风风风\n\n\n" NOR;

}
