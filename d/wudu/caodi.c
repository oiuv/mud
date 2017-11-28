inherit ROOM;

void create()
{
        set("short", "草地");
        set("long", @LONG
这里是林中的一片空地，四周被参天的古松环抱着，当中是一片
绿油油的草地。草地中央地上有一个拳头大小的小洞，旁边丈许方圆
寸草不生，露出红褐色的土壤。四周一片寂静，草地上阳光明媚，但
你的心情却一也不轻松，这里该不会有什么危险吧？
LONG );
        set("outdoors", "wudujiao");

        set("exits", ([
                "south" : __DIR__"sl7",
        ]));

        if (random(3) > 1)
                set("objects", ([
                        "/clone/beast/jinshewang" : 1,
                ]));

        setup();
        //replace_program(ROOM);
}
