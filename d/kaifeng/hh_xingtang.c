inherit ROOM;

void create()
{
        set("short", "刑堂");
        set("long", @LONG
此处乃红花会总舵内的刑堂所在，戒备甚为森严。执掌这
里的便是会中的第十二把交椅，人称“鬼见愁”的石双英。他
铁面无私，心狠手辣，犯了规条的就是逃到天涯海角，他也必
派人抓来处刑，是以红花会兄弟，提到鬼见愁时无不悚然。
LONG);
        set("no_clean_up", 0);
        set("exits", ([
  		"west" : __DIR__"hh_hguangchang",
	]));
        set("objects", ([
                CLASS_D("honghua") + "/shi" : 1,
        ]));
        setup();
        replace_program(ROOM);
}
