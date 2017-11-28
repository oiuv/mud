inherit ROOM;

void create()
{
        set("short", "荆州东门" );
        set("long", @LONG
这里便是荆州东门，荆州历来都是军事要地，因此城墙坚
实无比，城楼高高耸立，来往的人很多，荆州也是从蜀地进入
中原的必经之路，所以各色人等混杂，你还是小心一点。东去
则是通往扬州的交通要道。
LONG);
        set("objects", ([
                "/d/city/npc/bing" : 4,
                "/d/beijing/npc/ducha" : 1,
        ]));
        set("exits", ([
        	"east" : __DIR__"guandao3",
        	"west" : __DIR__"dongdajie2",
        ]));
        set("outdoors", "jingzhou");

        setup();
        replace_program(ROOM);
}

