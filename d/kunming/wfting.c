inherit ROOM;

void create()
{
        set("short", "望峰亭");
        set("long", @LONG
这里是石林最高的一座峰，峰上有一小亭，真不知道是如
何建造出来的，放眼看去，只见四面石峰林立，一时间眼睛都
看花了。
LONG);
        set("outdoors", "kunming");
        set("exits", ([                
                "down" : __DIR__"lianhua",
        ]));
        setup();
        replace_program(ROOM);
}
