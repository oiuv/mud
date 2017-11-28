inherit ROOM;

void create()
{
        set("short", "土路");
        set("long", @LONG
这是一条黄土飞扬的路，不算太宽，给人一种落寞的感觉，路
边零零散散的分布着几片小田地，偶然也能看得见一些炊烟。四周
一片的荒寂。
LONG);
        set("exits",  ([
                "west" : "/d/lanzhou/dongmen",
                "east" : __DIR__"tulu2",
        ]));
        set("outdoors", "lanzhou");
        setup();
        replace_program(ROOM);
}
