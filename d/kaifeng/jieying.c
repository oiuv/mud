inherit ROOM;

void create()
{
        set("short", "接引佛殿");
        set("long", @LONG
接引佛殿向来是开封城内最热闹的地方。谁不想被接引到
西方佛地呢。殿内供奉接引佛像，佛像前供桌上一盏佛门心灯
造形奇古，整日长明，从此殿出去，就能看到开封铁塔了。
LONG
        );
        set("no_clean_up", 0);
        set("exits", ([
  		"west" : __DIR__"road6",
  		"east" : __DIR__"tieta",
	]));
        set("outdoors", "kaifeng");

        setup();
        replace_program(ROOM);
}
