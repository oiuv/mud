// Room: /d/xiangyang/anfupailou.c
// Date: Jan. 8 1999 by Winder

inherit ROOM;

void create()
{
	set("short", "安抚府牌楼");
	set("long", @LONG
这里是安抚使府前的一座牌楼，高达二丈，由黄玉制成，
和东面的将军府屋顶的琉璃瓦在阳光的照耀下黄白掩映，金碧
辉煌，令人目为之眩，感觉分外巍峨庄严。你抬头望去，但见
牌楼上四个大金字“安抚使府”。牌楼下站着两派手那刀枪的
宋兵，紧紧盯着每一个靠近这儿的人。北面就是安抚府大院了。
南面就是襄阳的中央广场。
LONG );
        set("outdoors", "xiangyang");
	set("no_clean_up", 0);

	set("exits", ([
		"south" : __DIR__"guangchang",
		"north" : __DIR__"anfugate",
	]));
	setup();
	replace_program(ROOM);
}
