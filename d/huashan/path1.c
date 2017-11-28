inherit ROOM;

void create()
{
        set("short", "华山脚下");
        set("long", @LONG
这便是五岳中西岳华山，巍然耸立于陕西省华阴县城南。华山北瞰黄
河，南连秦岭，五座山峰高低错落，各据一方，其间又有一段若断若续的
山岭相连，疏密有度，神韵天成，远远望去，状若巨朵青莲，外围诸峰如
莲瓣，中间三峰似莲蕊，因此山便因『花』得名，取名华山。又因其西临
少华山，故华山又称太华。它素有『奇峰天下第一山』之称，西面是一个
小村，而由东穿过野猪林便可到达开封府。
LONG);
        set("exits", ([
            	"west" : "/d/village/eexit",
            	"east" : "/d/kaifeng/yezhulin",
            	"north" : __DIR__"yuquan",
            	"southeast" : __DIR__"shaluo",
        ]));
        set("no_clean_up", 0);
        set("outdoors", "huashan" );

        setup();
        replace_program(ROOM);
}
