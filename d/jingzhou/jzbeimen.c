inherit ROOM;

void create()
{
        set("short", "荆州北门" );
        set("long", @LONG
这里是荆州的北门，由于荆州历来都是军事要地，因此城
墙坚实无比，城楼高高耸立，由于北门以外，人烟稀少，来往
的人不多，所以官兵的防卫也就不十分严密。
LONG);
        set("objects", ([
                "/d/city/npc/bing" : 4,
                "/clone/npc/xunbu" : 1,
                "/d/beijing/npc/ducha" : 1,
        ]));
        set("exits", ([
        	"northup" :"/d/wudang/wdroad5",
	        "south" :__DIR__"beidajie2",
  
        ]));
        set("outdoors", "jingzhou");
        setup();
        replace_program(ROOM);
}

