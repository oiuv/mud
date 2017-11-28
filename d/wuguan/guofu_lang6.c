inherit ROOM;

void create()
{
        set("short", "长廊");
        set("long", @LONG
这是个长廊，往北通向休息室，南面是物品房，这里静悄
悄的，人们走路都也是小心翼翼的。生怕吵着北面休息室里正
在休息的人。
LONG);
        set("no_fight", 1);
        set("exits", ([
               "north" : __DIR__"guofu_woshi1",
               "south" : __DIR__"guofu_wupinfang",
        ]));
        setup();
        replace_program(ROOM);
}
