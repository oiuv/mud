//Room: miao.c

inherit ROOM;

void create ()
{
        set ("short", "城隍庙");
        set ("long", @LONG
庙有一大半倾塌了，本来就不大，现在就显得更小了，不过小无减
于它的慑人气氛。没有倾塌的是神殿的一角，而且刚好是神像所在的地
方，所以那尊土塑的山神还算是完好的。这也不知是比照哪一位尊神所
塑的像？青面潦牙，眼睛瞪得像两枚铜铃，而且还熠熠发光。
LONG);
        set("exits", ([
        	"west"   : __DIR__"yongtai-dadao4",
        ]));
        set("objects", ([
        	__DIR__"npc/keeper"   : 1,
        ]));

        setup();
        replace_program(ROOM);
}
