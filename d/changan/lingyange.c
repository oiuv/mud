//Room: lingyange.c

inherit ROOM;

void create()
{
        set("short", "凌烟阁");
        set("long", @LONG
窄窄的门，窄窄的楼梯，布置清雅的房间，窗户都很宽大从窗内看
出去，满城秋色俱在眼前。
LONG);
        set("exits", ([ /* sizeof() == 1 */
        	"west" : __DIR__"fengxu4",
        ]));

	setup();
        replace_program(ROOM);
}
