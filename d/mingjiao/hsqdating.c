//HSQTING.C

inherit ROOM;

void create()
{
        set("short", "洪水旗大厅");
        set("long", @LONG
这里是洪水旗的大厅，厅中四壁漆墨，连桌案台椅俱为黑色，
枪曳黑缨，剑垂玄穗，布置得冷漠森严。厅中央摆有茶几，洪水
旗掌旗使唐洋正襟而坐，面带杀气。
LONG );
        set("exits", ([
                "south" : __DIR__"hsqchanglang",
        ]));
        set("objects", ([
                __DIR__"npc/tangyang": 1,
        ]));
//        set("no_clean_up", 0);
        setup();
        replace_program(ROOM);
}
