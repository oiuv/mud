inherit ROOM;

void create()
{
        set("short", "演出大厅");
        set("long", @LONG
这里就是大厅，台上正唱着戏呢，你可以坐下来叫上一壶
茶，好好的做一次票友。台上那位演员虽不是名角，唱起戏来
倒也是有板有眼，让人心情一畅，偶然的不快顿时烟消云散。
LONG);

	set("outdoors", "zhongzhou");

        set("exits", ([
                "east" : __DIR__"xiyuan",
                "west" : __DIR__"huazhuang",    
	]));

        set("objects",([
                "/d/beijing/npc/guanzhong" : 2,
        ]));

        setup();
        replace_program(ROOM);
}
