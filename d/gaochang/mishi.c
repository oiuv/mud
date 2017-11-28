#include <ansi.h>
inherit ROOM;

void create()
{
        set("short", "高昌后殿");
        set("long", @LONG
这里是高昌迷宫的后殿，大厅里有几具白骨骷髅只见大半
宫室已然毁圯，殿堂中堆满了黄沙。往北边似乎还有路，在阴
暗处站有一人正好挡住了去路。
LONG);
        set("exits", ([
                "south" : __DIR__"zoulang2",
                "north" : __DIR__"mishi2"
        ]));
        set("maze", 1);
        setup();
}

void init()
{
        object ob, room;
        ob = this_player();
        room = this_object();

        if (present("map", ob))
        {
                message_vision(HIY "\n突然之间，只听前面一个阴森森的声音冷笑道：“果然是有胆\n"
                               "之士，怎么你有高昌迷宫的地图？难道是天意？高昌迷宫真的\n"
                               "有敌国的财富吗？哈……哈哈……哈哈哈哈……”笑声中透着\n"
                               "无限的凄凉和悲状。\n\n" NOR, ob);
        } else
        {
                message_vision(HIR "\n突然之间，只听前面一个阴森森的声音冷喝道：“擅闯高昌迷\n"
                               "宫者死！”顿时只见一点光向你袭来，你想躲也躲不开了。原\n"
                               "来是一根毒针插入你的身体。\n\n" NOR, ob);
                ob->set_temp("die_reason", "被毒针射死了");
                ob->die();
        }

}
