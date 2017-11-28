// Room: /u/zqb/tiezhang/shijie-3.c

inherit ROOM;

void create()
{
	set("short", "石阶");
	set("long", @LONG
只见一排石阶盘旋而下，消失在浓浓的黑暗中。石阶上长满的绿色的青
苔，滑不留脚。远处黑暗的尽头似乎有点昏黄的光亮。
LONG	);
	set("exits", ([ /* sizeof() == 2 */
  "westdown" : __DIR__"shishi",
  "southup" : __DIR__"shijie-2",
]));
	set("no_clean_up", 0);

	setup();
	replace_program(ROOM);
}
