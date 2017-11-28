// shanmen.c 山门

inherit ROOM;

void create()
{
        set("short", "山门");
        set("long", @LONG
你的面前是一座林木繁茂的高山，几座山峰在云雾中隐约可见，
一条山径向山上延伸，不时有几个江湖好汉从你身边走过，他们都是
到侠客岛来专研武功的。石壁上刻着三个大字 "侠客岛" ，这就是江
湖上传闻的侠客岛。
LONG );
        set("outdoors", "xiakedao");
        set("exits", ([
                "southup" : __DIR__"road1",
                "north" : __DIR__"lin8",
        ]));
        set("objects", ([
                __DIR__"npc/dizi2" : 1]));
        setup();
        replace_program(ROOM);
}
