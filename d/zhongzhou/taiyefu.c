inherit ROOM;

void create()
{
        set("short", "县太爷府");
        set("long", @LONG
一进大门，就看见正厅北面的墙上的一副猛虎下山的中堂。
下面的长台上放着两个大大的唐三彩的骏马。一张红木的桌子
就在长台的前面。往门口两边是一排椅子，整个大厅的家具都
是红木的，外面的光照进来反射出一片暗暗的红光。
LONG);
        set("exits", ([
                "south" : __DIR__"huayuan",
        ]));

        setup();
        replace_program(ROOM);
}

