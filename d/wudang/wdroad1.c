inherit ROOM;

void create()
{
        set("short", "青石大道");
        set("long", @LONG
你走在一条青石大道上，人来人往非常繁忙，不时地有人
骑着马匆匆而过。大道两旁有一些小货摊，似乎是集市。北边
通向扬州城。东南是一大片树林。
LONG);
        set("outdoors", "wudang");
        set("exits", ([
                "south" : __DIR__"wdroad2",
                "north" : "/d/city/nanmen",
        ]));
        set("no_clean_up", 0);
        setup();
        replace_program(ROOM);
}
