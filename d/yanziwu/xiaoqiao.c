//ROOM: xiaoqiao.c

inherit ROOM;

void create()
{
        set("short", "紫菱桥");
        set("long",@LONG
细竹搭就的一座小小拱桥，竹制的栏杆雕有别致的花纹，
桥的北端隐隐有一座小小木屋。站在桥上，你觉的心旷神怡，
久久不愿离去。
LONG );
        set("outdoors", "yanziwu");
        set("exits", ([
            "north" : __DIR__"tingyu",
            "east"  : __DIR__"xiaojing",
        ]));
        set("no_clean_up", 0);
        setup();
        replace_program(ROOM);
}
