// kurong.c

// 六脉神剑载体

#include <ansi.h>

#define MIJI "/clone/lonely/book/liumai-shenjian"

inherit NPC;
inherit F_MASTER;


int ask_me();
void start_fight(object me);
void close_exit();
void open_exit();

string* names = ({
	"ben yin",
	"ben can",
	"ben chen",
	"ben guan",
	"ben xiang",
});

void create()
{
	set_name("枯荣大师", ({ "kurong", "ku"}) );
	set("gender", "男性" );
	set("title", "天龙寺第十六代僧人");
	set("class", "bonze");
	set("long", @LONG
他的面壁而坐，看不见面貌。
LONG );
	set("age", 95);
	set("shen_type", 1);
	set("str", 32);
	set("int", 34);
	set("con", 31);
	set("dex", 32);

	set("qi", 5500);
	set("max_qi", 5500);
	set("jing", 2700);
	set("max_jing", 2700);
	set("neili", 6700);
	set("max_neili", 6700);
	set("jiali", 120);
	set("combat_exp", 2700000);

	set_skill("force", 300);
	set_skill("dodge", 280);
	set_skill("parry", 280);
	set_skill("finger", 280);
	set_skill("tiannan-step", 280);
	set_skill("kurong-changong", 280);
        set_skill("duanshi-xinfa", 300);
	set_skill("sun-finger", 280);
	set_skill("literate", 260);
	set_skill("buddhism", 260);
        set_skill("lamaism", 260);
        set_skill("martial-cognize", 220);

	map_skill("force", "kurong-changong");
	map_skill("dodge", "tiannan-step");
	map_skill("parry", "sun-finger");
	map_skill("finger", "sun-finger");

	prepare_skill("finger","sun-finger");

	set("inquiry" ,([
		"六脉神剑" : (: ask_me :),
		"六脉神剑谱" : (: ask_me :),
		"六脉神剑剑谱" : (: ask_me :),
	]));
	create_family("大理段家", 14, "高僧");

	set_temp("apply/damage", 50);
	set_temp("apply/armor", 50);

	setup();
	carry_object("/clone/cloth/seng-cloth")->wear();
}

int remove_killer(object ob)
{
        object env;

        ::remove_killer(ob);

        if (sizeof(query_killer())) return 1;

        env = environment();
        if (env->query("exits")) return 1;

        message_vision("$N叹了一口气，道：出家人岂能滥杀无"
                       "辜？然而降妖除魔，也是无法。\n",
                       this_object());

        open_exit();
        return 1;
}

int recognize_apprentice(object ob, string skill)
{
        if (ob->query("shen") < -5000)
                command("say 你虽魔性太重，但是佛门广大，老衲奉劝施主以后还是多多向善。");

        if (skill == "literate")
        {
                command("say 抱歉，想学文化请去找教书先生。");
                return -1;
        }

        if (! query_skill(skill, 1))
        {
                command("say 嘿嘿，老僧不会，你另请高明吧。");
                return -1;
        }

        if (skill != "lamaism" && skill != "buddhism")
        {
                command("say 做人不要一味凶猛好杀，尽学一些"
                        "杀伤人命的武技。");
                return -1;
        }

        if (ob->query_temp("mark/枯荣"))
                return 1;

        command("nod");
        command("say 好，我就和你谈谈一些佛法方面的体会。");
        ob->set_temp("mark/枯荣", 1);
        return 1;
}

int ask_me()
{
        object me;

        me = this_player();
	if (me->query("born_family") != "段氏皇族")
	{
		message_vision("$N冷笑一声道：" +
			       RANK_D->query_respect(this_player()) +
			       "打听我们天龙寺镇寺之宝干什么？\n",
			       this_object());
		return 1;
	}

	message_vision("$N淡然对$n道：你虽然是皇族之人，但是也不"
                       "得染指六脉神剑剑谱。\n", this_object(), me);
        return 1;
}

int accept_fight(object ob)
{
        command("say 我没有兴趣陪你打架。");
    	return 0;
}

int accept_hit(object ob)
{
        command("heng");
        command("command 你要找死么？");
        start_fight(ob);
    	return 1;
}

int accept_kill(object ob)
{
        command("haha");
        command("say 来的好！咱们就较量一番！");
        start_fight(ob);
        return 1;
}

void start_fight(object me)
{
        object *obs, ob;
        string msg;
        int i;

        if (!living(this_object()))
                return;

        if (base_name(environment()) != query("startroom") ||
            is_killing(me->query("id")))
        {
                command("say 那就打吧。");
                return;
        }

        if (is_fighting())
        {
                command("chat 哈哈！" + me->query("name") +
                        "你这" + RANK_D->query_rude(me) +
                        "也来添乱？");
        } else
        {
                command("chat 哼！好你个" + me->query("name") +
                        "，既然要挑我们天龙寺的百年威名，那"
                        "就来吧！");
        }

        obs = ({ });
        msg = 0;
        for (i = 0; i < sizeof(names); i++)
        {
                if (! objectp(ob = present(names[i])))
                        continue;

                if (! living(ob))
                        continue;

                obs += ({ ob });
                if (! msg)
                        msg = ob->name();
                else
                        msg += "、" + ob->name();
        }

        if (msg)
                command("say " + msg + "，大家一起把这贼子杀了！");
        else
                command("say 也罢，就由老僧我来超度你吧！");

        obs->kill_ob(me);
        kill_ob(me);
        close_exit();
}

void die(object killer)
{
        object ob;
        object kob;

        ob = find_object(MIJI);
        if (! objectp(ob))
                 ob = load_object(MIJI);


           // if (! environment(ob) && random(30) == 1)
           if (! environment(ob) && random(15) == 1)
        {
                ob->move(this_object(), 1);
                CHANNEL_D->do_channel(this_object(), "rumor", "听说" +
                        (objectp(kob) ? kob->name(1) : "某人") +
                        "闯入天龙寺，力战众僧，夺走六脉神剑谱。");
        } else
                command("chat 天哪！想不到我枯荣饱遭凌辱，天龙威名尽丧我手！");

        open_exit();
        ::die(killer);
}

void close_exit()
{
        object room;
        object here;

        here = environment();
        room = find_object("/d/tianlongsi/banruotai");
        if (! room) room = load_object("/d/tianlongsi/banruotai");

        if (! here->query("exits"))
                return;

        message_vision("$N劈空一掌，登时将大门闭上。\n", this_object());
        here->delete("exits");

        if (room)
        {
                message("vision", "忽然“砰”的一下" +
                        room->query("short") + "的大门闭上了。\n", room);
                room->delete("exits/south");
        }
}

void open_exit()
{
        object room;
        object here;

        here = environment();
        room = find_object("/d/tianlongsi/banruotai");
        if (! room) room = load_object("/d/tianlongsi/banruotai");

        if (here->query("exits"))
                return;

        message("vision", "大门“吱呀吱呀”的打开了。\n", here);
        here->set("exits/north", "/d/tianlongsi/banruotai");

        if (room)
        {
                message("vision", "忽然" + room->query("short") +
                        "的大门“吱呀吱呀”的打开了。\n", room);
                room->set("exits/south", "/d/tianlongsi/munitang");
        }
}
