inherit ROOM;

void create()
{
	set("short", "闭月亭");
	set("long", @LONG
亭上交缠蔷薇、木香、刺梅、金雀，桥下撒满凤仙、鸡冠、秋葵等种。
更有那金萱、百合、剪春罗、剪秋罗、满地娇、缠枝牡丹等类，不可枚举。
遇开放之时，烂漫如锦屏。远离数尺，尽植名花异草。一花未谢，一花又
开。
LONG);
	set("no_clean_up", 0);
	set("exits", ([
  		"south" : __DIR__"jiyuan2",
	]));

	setup();
	replace_program(ROOM);
}
