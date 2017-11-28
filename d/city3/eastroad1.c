inherit ROOM;

void create()
{
	set("short", "东大街");
	set("long", @LONG
你走在东大街坚实的青石板地面上。南边可以通向东城门
路边有一个简陋的茶摊，一块洗得发白了的旧帆布正顶着头顶
火辣辣的阳光，一张长几上放着几只大号粗瓷碗。碗中盛满着
可口的茶水。往西北通往北大街，东北方一座大店面里传出阵
阵划拳的喧闹。
LONG );
        set("outdoors", "chengdu");
        set("resource/water", 1);
	set("exits", ([
	    	"northeast" : __DIR__"jiudian",
	    	"northwest" : __DIR__"northroad3",
	    	"south"     : __DIR__"eastroad2",
	]));
	set("objects", ([
	    	__DIR__"npc/xiaozei" : 1,
	]));
	setup();

        replace_program(ROOM);
}