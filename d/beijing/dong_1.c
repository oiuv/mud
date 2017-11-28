#include <room.h>
inherit ROOM;

void create()
{
	set("short", "地东大街");
	set("long", @LONG
这里是北京城地安门的东街。街道是整整齐齐的杨树林，道上行人络绎不
绝，车两马匹穿插其中。大街上由闲逛的游人，上京赶考的考生，背负着担子
的挑夫以及正在玩耍着的幼童构出了一幅繁忙热闹的盛世景象。北边是地安门
东街的广场。南边警备深严，不时有官兵进进出出，原来那里就是京城的特务
机构东厂的大门所在地。东边是著名的王府井大街。
LONG );
       set("exits", ([
		"north" : __DIR__"di_donggc",
		"east" : __DIR__"wang_7",
		"south" : __DIR__"dongchang_men",
	]));
	set("objects", ([
		__DIR__"npc/bing2" : 1,
		__DIR__"npc/taijian" : 1,
	]));
	set("outdoors", "beijing");
	setup();
	replace_program(ROOM);
}

