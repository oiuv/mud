//Room: jiulou.c

inherit ROOM;

void create()
{
        set("short", "望星楼");
        set("long", @LONG
望星楼飞檐碧瓦，酒幌高挑，是个二层楼。楼上设有回廊，雕梁画
柱，华丽铺排。下面是青砖墙皮，洞开的小窗绘成红框，十分素雅。楼
上正中，挂着一块黑漆漆的横匾，上面的三个绣金大字“望星楼”是以
狂草书成，笔力雄劲，灵动欲飞。
LONG);
        set("exits", ([
        	"south" : __DIR__"qixiang1",
        	"up" : __DIR__"jiulou2",
        ]));
        set("objects", ([
        	__DIR__"npc/xiaoer2" : 1,
        ]));

        setup();
        replace_program(ROOM);
}
