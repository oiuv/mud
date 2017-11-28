#include <room.h>
inherit ROOM;

void create()
{
	set("short", "地西大街");
	set("long", @LONG
这里是北京城地安门的西街。街道是整整齐齐的杨树林，道上行人络绎不
绝，车两马匹穿插其中。大街上由闲逛的游人，上京赶考的考生，背负着担子
的挑夫以及正在玩耍着的幼童构出了一幅繁忙热闹的盛世景象。北边是京城里
最大的钱庄，南边是地安门的西街广场。
LONG );
       set("exits", ([
		"north" : __DIR__"qianzhuang",
		"south" : __DIR__"di_xigc",
		"east" : __DIR__"di_dajie1",
		"west" : __DIR__"di_4",
	]));

	set("outdoors", "beijing");
	setup();
	replace_program(ROOM);
}

