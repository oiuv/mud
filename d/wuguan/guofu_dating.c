inherit ROOM;

void create()
{
        set("short", "郭府大厅");
        set("long", @LONG
这里是郭府的客厅。厅虽不大，却布置的挺雅致。东壁悬
挂着四幅屏条，绘的是梅兰菊竹四种花卉；西壁悬挂的是春夏
秋冬。内厅居中的是一张八仙桌。桌上端放着一套茶具，两旁
摆放着四张檀香椅，显得极为古朴。厅角各摆放着一盆牡丹花
似乎给这里带来一丝暖意。北壁内墙神龛供奉岳飞的画像，上
面是一条横幅，上书「还我河山」。往北走是个长廊，一直通
向馆主的卧室。
LONG);
        set("no_fight", 1);
        set("exits", ([
               "south" : __DIR__"guofu_dayuan2",
               "north" : __DIR__"guofu_lang5",
               "west" : __DIR__"guofu_shilu-2",
               "east" : __DIR__"guofu_shilu-1",
        ]));

        setup();
        "/d/wuguan/npc/guojing"->come_here();
}
