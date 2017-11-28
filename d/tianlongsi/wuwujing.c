inherit ROOM;

void create()
{
        set("short", "无无境");
        set("long",@LONG
一片水池静卧眼前，一座精雕木桥横跨其上，与其倒影恰成一圆，映
着空灵的水面，使你心中似有所动。仿佛体会到了众生之源，万物之本的
真谛。
LONG );
        set("outdoors","tianlongsi");
        set("exits", ([
            "north": __DIR__"yaotai",
            "south": __DIR__"qingxinge",    			
            "west" : __DIR__"cibeiyuan",
            "east" : __DIR__"yuhuayuan",
        ]));
        set("no_clean_up", 0);
        setup();
        replace_program(ROOM);
}
