inherit ROOM;

void create()
{
        set("short", "柳浪桥");
        set("long", @LONG
每当春至站在桥上，沿湖垂柳在风中摇曳如翠浪翻空，黄
莺在枝头迎春嬉戏，鸣声婉转，故得名「浪桥闻莺」。
LONG);
        set("exits", ([
            	"southwest" : __DIR__"jujingyuan",
        ]));
        set("outdoors", "hangzhou");
        setup();
        replace_program(ROOM);
}
