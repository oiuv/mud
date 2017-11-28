inherit ROOM;

void create()
{
        set("short", "放生池");
        set("long", @LONG
从三尺台阶走下就是大街了。台阶旁挖了一个小池子，边
上用白石围起了栏杆。北边的池壁上『放生池』几个字涂成了
红色。由于池的一边靠近街道，方便别人作出善举，但整天见
人把鱼放下，却是去总看不见踪影，多半是被附近的泼皮无赖
晚上摸来作宵夜了。
LONG);
        set("no_clean_up", 0);
        set("exits", ([
  		"east" : __DIR__"qianshou",
  		"westdown" : __DIR__"wroad",
	]));
        set("objects", ([
                "/clone/npc/walker" : 1,
        ]));
        set("outdoors", "kaifeng");

        setup();
        replace_program(ROOM);
}
