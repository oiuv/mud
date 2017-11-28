#include <room.h>
inherit ROOM;

void create()
{
	set("short", "地西大街");
	set("long", @LONG
这里是北京城地安门的西街。街道是整整齐齐的杨树林，道上行人络绎不
绝，车两马匹穿插其中。大街上由闲逛的游人，上京赶考的考生，背负着担子
的挑夫以及正在玩耍着的幼童构出了一幅繁忙热闹的盛世景象。北方是一座富
丽堂皇的巨宅，那就是当朝第一大臣，被御封为“满洲第一勇士”的鳌拜的府
邸。向南经过西单北大街可以通往西单。西方接西四北大街。
LONG );
       set("exits", ([
		"north" : __DIR__"aofu_men",
		"south" : __DIR__"di_3",
		"east" : __DIR__"di_5",
		"west" : __DIR__"shi_3",
	]));
	set("objects", ([
		__DIR__"npc/boy2" : 1,
	]));
	set("outdoors", "beijing");
	setup();
	replace_program(ROOM);
}

