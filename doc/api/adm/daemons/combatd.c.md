## 说明

    战斗系统守护进程

## 继承

    inherit F_DBASE;
    inherit F_CLEAN_UP;

## 属性

    string *guard_msg = ({
        append_color(CYN "$N注视著$n的行动，企图寻找机会出手。\n" NOR, CYN),
        append_color(CYN "$N正盯著$n的一举一动，随时准备发动攻势。\n" NOR, CYN),
        append_color(CYN "$N缓缓地移动脚步，想要找出$n的破绽。\n" NOR, CYN),
        append_color(CYN "$N目不转睛地盯著$n的动作，寻找进攻的最佳时机。\n" NOR, CYN),
        append_color(CYN "$N慢慢地移动著脚步，伺机出手。\n" NOR, CYN),
    });

    string *catch_hunt_msg = ({
        append_color(HIW "$N和$n仇人相见分外眼红，立刻打了起来！\n" NOR, HIW),
        append_color(HIW "$N对著$n一声大喝，蓦地直冲过来！\n" NOR, HIW),
        append_color(HIW "$N和$n一碰面，二话不说就打了起来！\n" NOR, HIW),
        append_color(HIW "$N一眼瞥见$n，「哼」的一声冲了过来！\n" NOR, HIW),
    });

    string *winner_msg = ({
        append_color(CYN "\n$N哈哈大笑，说道：承让了！\n\n" NOR, CYN),
        append_color(CYN "\n$N双手一拱，笑著说道：承让！\n\n" NOR, CYN),
        append_color(CYN "\n$N胜了这招，向后跃开三尺，笑道：承让！\n\n" NOR, CYN),
        append_color(CYN "\n$N双手一拱，笑著说道：知道我的利害了吧！\n\n" NOR, CYN),
        append_color(CYN "\n$n向后退了几步，说道：这场比试算我输了，下回看我怎么收拾你！\n\n" NOR, CYN),
        append_color(CYN "\n$n向后一纵，恨恨地说道：君子报仇，十年不晚！\n\n" NOR, CYN),
        append_color(CYN "\n$n脸色一寒，说道：算了算了，就当是我让你吧！\n\n" NOR, CYN),
        append_color(CYN "\n$n纵声而笑，叫道：“你运气好！你运气好！”一面身子向后跳开。\n\n" NOR, CYN),
        append_color(CYN "\n$n脸色微变，说道：佩服，佩服！\n\n" NOR, CYN),
        append_color(CYN "\n$n向后退了几步，说道：这场比试算我输了，佩服，佩服！\n\n" NOR, CYN),
        append_color(CYN "\n$n向后一纵，躬身做揖说道：阁下武艺不凡，果然高明！\n\n" NOR, CYN),
    });

    nosave string foo_before_hit = 0;
    nosave string foo_after_hit = 0;

## 方法

    void set_bhinfo(string msg);
    void set_ahinfo(string msg);
    string query_bhinfo();
    string query_ahinfo();
    void clear_bhinfo();
    void clear_ahinfo();
    string damage_msg(int damage, string type);
    string eff_status_msg(int ratio);
    string status_msg(int ratio);
    int valid_power(int combat_exp);
    varargs int skill_power(object ob, string skill, int usage, int delta);
    varargs int do_attack(object me, object victim, object weapon, int attack_type);
    varargs string do_damage(object me, object target, mixed type, int damage, int percent, mixed final);
    void fight(object me, object victim);
    void auto_fight(object me, object obj, string type);
    void start_berserk(object me, object obj);
    void start_hatred(object me, object obj);
    void start_vendetta(object me, object obj);
    void start_aggressive(object me, object obj);
    int player_escape(object killer, object ob);
    void announce(object ob, string event);
    void winner_reward(object winner, object victim);
    void killer_reward(object killer, object victim);
    void hit_with_poison(object me, object victim, object ob);
    void hit_poison(object me, object victim, object ob);
    void clear_announce(object me);
