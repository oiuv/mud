inherit ROOM;

void create()
{
  	set("short","内室");
  	set("long",@LONG
这是一个精雅的小舍，进门便可闻到一阵浓冽的花香。房
中挂着一幅五女向凤图，绘着五个宫装美女美目盼兮，艳丽脱
俗。屋里还有一张茶几，几张椅子，椅子上铺着绣花锦垫，西
面有一扇洞形门通向后厅。
LONG);
        set("exits", ([
                "south" : __DIR__"huoting",
        ]));
        if (random(6) == 1)
        {
              set("objects", ([
                      "/kungfu/class/riyue/dongfang/dongfang" : 1,
              ]));
        }
        else
              set("objects", ([
                       __DIR__"npc/shinu" : 1,
              ]));
 

        setup();
        replace_program(ROOM);
}
