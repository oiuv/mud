inherit ROOM;

void create()
{
	set("short", "大驿道");
	set("long", @LONG
你走在一条尘土飞扬的大驿道上。四周人来人往。挑担子
的行商，赶着大车的马夫，上京赶考的书生，熙熙攘攘，非常
热闹。不时还有快马从身边飞驰而过，扬起一路尘埃。马上的
人个个身着劲装，衣甲鲜明，有的还随身佩带着刀剑。看来都
是些些习武的江湖人。道路两旁是整整齐齐的杨树林。
LONG);
	set("exits", ([
		"south" : "/d/city/beimen",
		"north" : __DIR__"yidao1",
	]));
	set("outdoors", "nanyang");
	setup();
	replace_program(ROOM);
}

