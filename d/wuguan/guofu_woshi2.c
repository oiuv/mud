inherit ROOM;

void create()
{
    	set("short","休息室");
        set("long", @LONG
这里是郭府内的休息室，屋子有点点旧，但是打扫的非常
干净，一排床铺靠墙摆着，东面过去也是一间休息室，不断的
有人进来休息或醒后离去。
LONG);
        set("exits", ([
            "west" : __DIR__"guofu_woshi1",
        ]));
        set("no_fight", 1);
        set("sleep_room", 1);
        setup();
}
