inherit ROOM;

void create()
{
        set("short", "刘府西厢房");
        set("long", @LONG
这儿是西厢房，这儿整理得干干净净，窗外露出点绿绿的
枝叶，家具上一尘不染，地上铺着很大块的青砖，一点灰尘也
不沾。刘府的小孩们不知在这里悄悄说着什么。
LONG);
        set("exits", ([
               "east"   : __DIR__"liufudating",
        ]));

        set("objects", ([
                __DIR__"npc/liujing" : 1,
                __DIR__"npc/liuqin"  : 1,
        ]));

        setup();
	replace_program(ROOM);
}
