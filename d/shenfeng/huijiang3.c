inherit ROOM;

void create()
{
        set("short", "南疆小镇");
        set("long", @LONG
从草原上南下，便接近南疆沙漠了。这儿气候逐渐干燥热
浪时而从沙漠里涌来。沙漠里还走来骆驼商队，在这儿休息分
发货物。于是商铺林立人来人往十分热闹。西面是一小院。
LONG);
        set("outdoors", "shenfeng");
        set("exits", ([
            	"northup" : __DIR__"huijiang2",
                "south" : __DIR__"huijiang6",
            	"west" : __DIR__"huijiang4",
            	"east" : __DIR__"huijiang5",
        ]));
        set("no_clean_up", 0);
        setup();
        replace_program(ROOM);
}
