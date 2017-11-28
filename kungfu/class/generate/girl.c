// girl for user

#include <ansi.h>

inherit NPC;

#define DEFAULT_NAMR    "丫鬟"

void   set_owner(object owner);
string description();

void create()
{
        set_name(DEFAULT_NAMR, ({ "ya huan" }));
	set("age", 12 + random(8));
	set("attitude", "friendly");
        set("gender", "女性");

        set("max_qi", 1000);
        set("max_jing", 500);

        set("per", 20);
        set("str", 15);

	set("long", "她是一个小丫鬟。\n" + description());

        setup();

        carry_object("/clone/cloth/female" + (random(8) + 1) + "-cloth.c")->wear();        
        carry_object("/clone/cloth/female-shoe.c")->wear();

        if (clonep()) keep_heart_beat();
}

void set_owner(object owner)
{
        object *obs;

        set_temp("owner", owner);
        obs = owner->query_temp("hire");
        if (arrayp(obs))
        {
                obs = obs - ({ 0 }) + ({ this_object() });
                owner->set_temp("hire", obs);
        } else
                owner->set_temp("hire", ({ this_object() }));

        if (environment() &&
            environment(owner) == environment())
        {
                // 跟随主人
                message_vision("$N跟在$n的身后。\n", this_object(), owner);
                set_leader(owner);
        }

        set("title", owner->name(1) + "的丫鬟");
}

string long()
{
        object owner;
        string msg;

        if (! objectp(owner = query_temp("owner")))
                return ::long();

        msg = short() +
              "\n这是" + owner->name(1) + "(" + owner->query("id") +
              ")的贴身丫鬟。\n" + description();
        return msg;
}

int do_name(string arg)
{
        string mid;
        string msg;

        if (this_player() != query_temp("owner"))
                return 0;

        if (! stringp(arg))
                return notify_fail("你要起什么名字？\n");

        if (sscanf(arg, "%s %s", arg, mid) != 2)
                return notify_fail("你想起什么名字(name 中文名字 英文代号)？\n");

        if (strlen(mid) < 3)
                return notify_fail("你这个英文代号用的也太短了。\n");

        if (strlen(mid) > 8)
                return notify_fail("你这个英文代号用的也太短了。\n");

        if (! is_legal_id(mid))
                return notify_fail("英文代号必须使用英文小写字母。\n");

        if (! is_chinese(arg))
                return notify_fail("请你用中文起名字。\n");

        if (strlen(arg) < 4)
                return notify_fail("这个名字太短了。\n");

        if (strlen(arg) > 8)
                return notify_fail("你起的这个名字也太长了。\n");

        if (arg == name())
                return notify_fail("人家现在不就是叫这个名字么？\n");

        if (arg == this_player()->name(1))
                return notify_fail("你怎么取一个和自己一样的名字？\n");

        if (msg = NAME_D->invalid_new_name(arg))
        {
                write(msg);
                return 1;
        }

        if (query("name") != DEFAULT_NAMR)
                return notify_fail("人家已经有名字了，你就别费心了。\n");

        message_vision("$N想了一会儿，对$n道：“这样吧，以后你就叫" +
                       arg + "好了。”\n$n拍手道：“好呀好呀！就依" +
                       RANK_D->query_respect(this_player()) +  "之" +
                       "言，以后我就叫" + arg + "了。”\n",
                       this_player(), this_object());
        set_name(arg, ({ mid }));
        remove_action("do_name", "name");

        return 1;
}

int do_nick(string arg)
{
        if (! arg)
                return notify_fail("你要给" + name() + "一个什么昵称？\n");

	if (arg == "none")
	{
		delete("nickname");
		write("你把" + name() + "的绰号取消了。\n");
		return 1;
	}

	if (strlen(arg) > 80)
		return notify_fail("你的绰号占用的资源过多，请重新设置。\n");

	arg = replace_string(arg, "$BLK$", BLK);
	arg = replace_string(arg, "$RED$", RED);
	arg = replace_string(arg, "$GRN$", GRN);
	arg = replace_string(arg, "$YEL$", YEL);
	arg = replace_string(arg, "$BLU$", BLU);
	arg = replace_string(arg, "$MAG$", MAG);
	arg = replace_string(arg, "$CYN$", CYN);
	arg = replace_string(arg, "$WHT$", WHT);
	arg = replace_string(arg, "$HIR$", HIR);
	arg = replace_string(arg, "$HIG$", HIG);
	arg = replace_string(arg, "$HIY$", HIY);
	arg = replace_string(arg, "$HIB$", HIB);
	arg = replace_string(arg, "$HIM$", HIM);
	arg = replace_string(arg, "$HIC$", HIC);
	arg = replace_string(arg, "$HIW$", HIW);
	arg = replace_string(arg, "$NOR$", NOR);

        if (strlen(filter_color(arg)) > 30)
		return notify_fail("你想的这个绰号太长了，想一个短一点的、响亮一点的。\n");

        set("nickname", arg + NOR);
        write("你为" + name() + "选了一个绰号。\n");
        return 1;
}

mixed accept_ask(object who, string topic)
{
        object me;
        object owner;
        object *obs;
        object cob;
        string nick;

        me = this_object();

        if (! objectp(owner = query_temp("owner")))
                message_vision("$N看看周围，有些羞涩，没有回答$n的话。\n",
                               me, who);

        if (topic == "name" || topic == "名字" || topic == "姓名")
        {
                // 询问名字
                if (who != owner)
                        return "你打听我名字干什么？你是坏人还是好人？";

                if (name() == DEFAULT_NAMR)
                {
                        remove_action("do_name", "name");
                        add_action("do_name", "name");
                        return "我现在还没有名字呢，你给我起(name)一个好不好？";
                }

                return "我的名字叫" + name() + "呀，你不记得了么？";
        }

        if (topic == "nick" || topic == "昵称" || topic == "绰号")
        {
                // 询问昵称
                nick = query("nickname");
                if (who != owner)
                {
                        if (! stringp(nick) || strlen(nick) < 1)
                                return "我没有什么绰号哦。";

                        return "嗯... 人家都叫我" + nick + "。";
                }

                remove_action("do_nick", "snick");
                add_action("do_nick", "snick");

                if (! stringp(nick))
                        return "我现在没有绰号呀，是要给我起(snick)一个吗？";

                return "我现在叫" + nick + NOR CYN "呀，你打算给我换(snick)一个么？";
        }

        if (topic == owner->name(1) || topic == owner->query("id"))
        {
                if (who == owner)
                {
                        message_vision("$N抿着嘴嘻嘻一笑，对$n道：“你"
                                       "就不要逗我开心拉！”\n", me, who);
                        return 1;
                }

                return "是我主人呀！你找" + gender_pronoun(owner->query("gender")) +
                       "有什么事情么？";
        }

        if (topic == name() || topic == query("id"))
        {
                if (who == owner)
                        return "哎！我在这儿呢。";
                else

                        return "你找我有事情么？先问过我的主人吧。";
        }

        if (who != owner)
        {
                // 和主人是夫妻关系
                if (who->query("id") == owner->query("couple/id"))
                {
                        message_vision("$N盈盈对着$n道了一个万福。\n",
                                       me, who);        
                        return 1;
                }

                // 和主人是结拜兄弟关系
                if (who->is_brother(owner))
                {
                        message_vision("$N嘻嘻一笑，道：“" +
                                       RANK_D->query_respect(who) +
                                       "不要取笑我啦。”\n",
                                       me, who);
                        return 1;
                }

                // 陌生人
                switch (random(5))
                {
                case 0:
                        message_vision("$N眨着大眼睛，无辜的望着$n，一副"
                                       "天真无邪的样子。\n", me, who);
                        break;
                case 1:
                        message_vision("$N嘻嘻一笑，没有搭理$n。\n", me, who);
                        break;
                case 2:
                        message_vision("$N道：“" + owner->name(1) +
                                       "说啦，不让我和你们说话，外面坏人"
                                       "可多了。”\n", me, who);
                        break;
                case 3:
                        message_vision("$N闪了闪，对$n道：“我不懂事的，"
                                       "您别逗我啦。”\n", me, who);
                        break;
                default:
                        message_vision("$N听了$n的话，什么也没有说，只是"
                                       "用那双清澈的目光扫了$n一眼。\n", me, who);
                        break;
                }

                return 1;
        }

        if (topic == "all")
        {
                string *names;
                int count;

                obs = obs = all_inventory(me);
                obs = filter_array(obs, (: ! $1->query("equipped") :));
                if (! sizeof(obs))
                        return "我身上现在啥也没有呀。";

                count = 0;
                names = allocate(sizeof(obs));
                foreach (cob in obs)
                        if (! count || member_array(cob->name(), names) == -1)
                                names[count++] = cob->name();
                tell_object(who, sort_string(name() + "悄悄地告诉你：“我身上现在带着" +
                                             implode(names, "、") + "呢。”\n", 60));
                return "你现在要用什么？";
        }

        // 察看询问的是否是身上携带的物品
        obs = all_inventory(me);
        foreach (cob in obs)
        {
                if (cob->query("equipped"))
                        continue;

                if (filter_color(cob->name(1)) != topic && ! cob->id(topic))
                        continue;

                // 找到了
                message_vision("$N道：“等一下，在这儿呢。”说完掏出" +
                               cob->name() + "递给$n。\n", me, who);
                if (! cob->move(who))
                        message_vision("可是$n身上带的东西太多，没能接住$N的" +
                                       cob->name() + "。\n", me, who);
                return 1;
        }

        switch (random(3))
        {
        case 0:
                return "你说什么？我没听清楚呀。";
        case 1:
                return "哦？你是想要东西吗？要什么呢？";
        default:
                return "等...等一下，你说什么？";
        }
}

int accept_object(object who, object ob)
{
        object me;
        object owner;

        me = this_object();
        if (! objectp(owner = query_temp("owner")))
                return 0;

        if ((who != owner) && who->query("couple/id") != owner->query("id"))
        {
                message_vision("$N连忙摇头，道：“我可不能要您的东西，不然" +
                               (owner ? owner->name() : "主人") +"会责备我的。”\n", me);
                return 0;
        }

        if (ob->is_character() && query("can_speak"))
        {
                message_vision("$N皱皱眉，为难道，“这...这我不方便拿呀。”\n", me);
                return 0;
        }

        if (ob->is_corpse())
        {
                message_vision("$N“呀”了一声道：“这，这个也要我拿？”\n", me);
                return 0;
        }

        message_vision("$N道：“" + name() + "，你把这" + ob->name() +
                       "收好了。 ”\n", owner);
        if (ob->move(me))
        {
                message_vision("$N点点头，轻轻把" + ob->name() +
                               "接了过去，稳稳的收好。\n", me);
                return -1;
        }

        message_vision("$N“呜呜”道：“这个... 我已经拿不动了。”\n", me);
        return -1;
}

int accept_ansuan(object ob)
{
        return notify_fail("那么清纯的小姑娘，你不忍心下手。\n");
}

int accept_touxi(object ob)
{
        message_vision("然而$N看到那姑娘是如此天真清纯，再难忍心下手。\n", ob);
        return -1;
}

int accept_fight(object ob)
{
        message_vision("$N往后一缩，楚楚可怜的望着$n。\n",
                       this_object(), ob);
        return -1;
}

int accept_hit(object ob)
{
        message_vision("$N往后一缩，楚楚可怜的望着$n，让$n心中不由得一软。\n",
                       this_object(), ob);
        return -1;
}

int accept_kill(object ob)
{
        object me;
        object *obs;

        me = this_object();
        if (ob == query_temp("owner"))
        {
                message_vision("$N向后一退，委屈的喊道：“为什么，为什么"
                               "要这样对我？\n$n心中一软，没有下手，眼睁"
                               "睁的看着$N跑掉了。\n", me, ob);
                obs = all_inventory(me);
                obs = filter_array(obs, (: ! $1->query("equipped") :));
                if (sizeof(obs))
                {
                        message_vision("$N将身上的东西扔了一地...\n", me);
                        obs->move(environment());
                }
                destruct(me);
                return -1;
        }

        message_vision("$N连忙往后避去，委屈的冲$n喊道：“这位" +
                       RANK_D->query_respect(ob) +"，你认错人了吧！”\n",
                       me, ob);
	return -1;
}

void relay_emote(object me, string arg)
{
        string my_id;
        object owner;

        if (! objectp(owner = query_temp("owner")))
                return;

        my_id = me->query("id");
        if (me == owner || my_id == owner->query("couple/id"))

        switch (random(5))
        {
        case 0: command("shy");         return;
        case 1: command("shzi");        return;
        case 2: command("xixi");        return;
        case 3: command("@@ " + my_id); return;
        default:command("angry");       return;
        }

        if (me->query_temp("last_emote_with_girl") == time())
        {
                if (me->add_temp("last_emote_times", 1) > 2)
                {
                        message_vision(HIR "$N" HIR "冷笑一声，飞起一脚将$n"
                                       HIR "踢倒在地！\n", this_object(), me);
                        me->receive_damage("qi", 50, this_object());
                        me->receive_damage("jing", 40, this_object());
                        return;
                }
        } else
        {
                // reset count
                me->set_temp("last_emote_with_girl", time());
                me->delete_temp("last_emote_times");
        }

        arg = replace_string(arg, "1", "");
        arg = replace_string(arg, "2", "");
        arg = replace_string(arg, "3", "");
        arg = replace_string(arg, "4", "");
        arg = replace_string(arg, "5", "");
        switch (arg)
        {
        case "kiss":    command("rascal " + my_id);     break;
        case "hug":     command("escape " + my_id);     break;
        case "kok":     command("wuwu " + my_id);       break;
        case "kick":    command("killair " + my_id);    break;
        case "kickfly": command("papa");                break;
        case "wuwu":    command("comfort " + my_id);    break;
        case "comfort": command("say 我很好呀。");      break;
        case "killair": command("heng " + my_id);       break;
        case "slap":    command("angry " + my_id);      break;
        case "zhen":    command("pain");                break;
        case "poor":    command("say 你才可怜呢。");    break;
        case "xbc":     command("say 你才是小白菜呢。");break;
        case "flop":    command("standup");             break;
        case "tang":    command("say 不要...我不要！"); break;
        case "faint":   command("standup " + my_id);    break;
        case "break":   command("inn " + my_id);        break;
        case "cat":     command("xixi " + my_id);       break;
        case "lean":    command("shy " + my_id);        break;
        case "tnnd":    command("say 你这人好恶心哦。");break;
        case "wave":    command("say 你快走吧。");      break;
        case "shrug":   command("? " + my_id);          break;
        case "xixi":    command("say 你好不正经。");    break;
        case "laugh":   command("say 怎么像一个...傻子？");     break;
        case "inn":     command("nopretend " + my_id);  break;
        case "sorry":   command("tang " + my_id);       break;
        case "chaxie":  command("pat " + my_id);        break;
        case "pat":     command("escape");              break;
        case "smile":   command("smile " + my_id);      break;
        case "shzi":    command("say 乱指啥？");        break;
        case "haha":
        case "hehe":
        case "hoho":    command("say 傻笑什么。");      break;
        case "cut":
        case "knife":
        case "club":    command("say " + owner->name(1) + "救命呀！");          break;
        case "rascal":  command("say 我可天真了。");                            break;
        default:        command("say " + owner->name(1) + "！有坏人呀！");      break;
        }
}

void scan()
{
        object me;
        object ob;
        object env;

        me = this_object();

        if (! objectp(ob = query_temp("owner")))
        {
                if (environment())
                        message_vision("$N看了看四周，走了。\n", me);
                destruct(this_object());
                return;
        }

        env = environment(ob);
        if (environment() == env || ob->is_ghost())
                // 和主人在的地点相同，或是主人处于鬼魂状态
                return;

        if (is_busy() || is_fighting() || ! living(this_object()))
                // 现在忙
                return;

        if (! sizeof(env->query("exits")) ||
            environment() && ! sizeof(environment()->query("exits")))
                return;

        if (environment())
                message_vision("$N轻移莲步，慢慢走开了。\n", me);

        if (! move(env)) return;

        switch (random(3))
        {
        case 0:
                message_vision("$N慢慢走了过来，站在$n的身边，一双清澈"
                               "的眼睛巡视着周围。\n", me, ob);
                break;

        case 1:
                message_vision("$N三步并作两步，赶了过来，站到了$n的身"
                               "边。\n", me, ob);
                break;

        default:
                message_vision("$N悄悄地走了过来，站在$n的身后，望着大"
                               "家。\n", me, ob);
                break;
        }

        set_leader(ob);
}

string description()
{
        int per;

        per = query_per();
        if (per >= 30) return "她有倾国倾城之貌，容色丽郁，娇艳绝伦，堪称人间仙子！\n";
        if (per >= 28) return "她清丽绝俗，风姿动人。俏脸生春，妙目含情，轻轻一笑，不觉让人怦然心动。\n";
        if (per >= 26) return "她肤如凝脂，眉目如画，风情万种，楚楚动人。当真是我见犹怜！\n";
        if (per >= 24) return "她容色秀丽，面带晕红，眼含秋波。举手投足之间，确有一番风韵。\n";
        if (per >= 21) return "她气质高雅，面目姣好，虽算不上绝世佳人，也颇有几份姿色。\n";
        return "她相貌平平，还看得过去。\n";
}

string query_autoload()
{
        string nick;

        return sprintf("%s||%s||%d||%s", query("name"), query("id"), query("per"),
                       stringp(nick = query("nickname")) ? nick : "");
}

void autoload(string para, object owner)
{
        string arg, mid, nick;
        int per;

        if (! stringp(para) || sscanf(para, "%s||%s||%d||%s", arg, mid, per, nick) < 3)
        {
                arg = DEFAULT_NAMR;
                mid = "ya huan";
                per = 20;
        }

        if (stringp(nick) && strlen(nick) > 0)
                set("nickname", nick);

        set("per", per);
        set_name(arg, ({ mid }));
        set_owner(owner);
}

void move_or_destruct()
{
        move(VOID_OB);
}
