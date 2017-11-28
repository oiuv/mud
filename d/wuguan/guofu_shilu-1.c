inherit ROOM;

void create()
{
        set("short", "石板路");
        set("long", @LONG
你走在一条石板路上，从这里往东是物品房，你见有不少
人手里拿着各样的工具，从那边过来，西面是郭府的大厅。
LONG);
        set("no_fight", 1);
        set("exits", ([
              "east" : __DIR__"guofu_wupinfang",
              "west" : __DIR__"guofu_dating",
              "north" : __DIR__"guofu_xuetang",
              "south" : __DIR__"guofu_zhangfang",
        ]));
        set("outdoors", "wuguan");
        setup();
        replace_program(ROOM);
}
