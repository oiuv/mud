inherit ROOM;

int do_knock(string arg);

void create()
{
        set("short", "刘府东厢房");
        set("long", @LONG
这儿是东厢房，这儿整理得干干净净，窗外露出点绿绿的
枝叶，家具上一尘不染，地上铺着很大块的青砖，一点灰尘也
不沾。
LONG);
        set("exits", ([
               "west"   : __DIR__"liufudating",
        ]));

        set("objects", ([
                __DIR__"npc/liufuren" : 1,
        ]));

        setup();
	replace_program(ROOM);
}
