inherit ROOM;

void create()
{
        set("short", "华藏庵");
        set("long", @LONG
华藏庵是金顶的主要建筑，规模宏大，中祀普贤菩萨，旁
列万佛。华藏庵后边是睹光台，旁边是卧云庵。
LONG);
        set("outdoors", "emei");
        set("exits", ([
                "northwest" : __DIR__"jinding", 
                "southwest" : __DIR__"duguangtai",
                "enter"     : __DIR__"hcazhengdian",
        ]));

        set("no_clean_up", 0);
        setup();
        replace_program(ROOM);
}
