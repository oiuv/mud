inherit F_CLEAN_UP;
int help(object me);
varargs int loadall(string dir, object me);

// 排除规则对递归扫描和直接输入都生效，不执行隔离夹具或运行数据。
private int excluded_dir(string dir) {
    string part, prefix;
    foreach (part in explode(dir, "/")) {
        if (part == "tests" || part == "simul_efun" || part == "event" ||
            (strlen(part) && part[0] == '.'))
            return 1;
    }
    foreach (prefix in ({
        "/backup/", "/bin/", "/binaries/", "/fluffos/", "/data/", "/doc/", "/docs/",
        "/dump/", "/grant/", "/help/", "/log/", "/temp/", "/u/", "/version/",
        "/ai/", "/openspec/", "/www/", "/tools/"
    })) {
        if (strsrch(dir, prefix) == 0) return 1;
    }
    return 0;
}

int main(object me, string dir) {
    dir = resolve_path(me->query("cwd"), dir || "/");
    if (dir[<1] != '/') dir += "/";
    if (file_size(dir) != -2)
        return notify_fail("没有这个目录：" + dir + "\n");
    return loadall(dir, me);
}

varargs int loadall(string dir, object me) {
    string file, report, *entries, *sources;
    mixed err;
    object ob;
    int loaded, failed, skipped;

    dir = resolve_path("/", dir);
    if (dir[<1] != '/') dir += "/";
    if (excluded_dir(dir)) {
        report = "跳过非加载目录：" + dir + "\n";
        log_file("loadall", report);
        if (objectp(me)) tell_object(me, report);
        return 1;
    }
    entries = get_dir(dir);
    if (!arrayp(entries)) return 0;
    sources = lpc_source_files(dir);
    foreach (file in sources) {
        reset_eval_cost();
        ob = 0;
        err = catch(ob = load_object(file));
        if (err || !objectp(ob)) {
            failed++;
            log_file("loadall", sprintf("加载失败：%s\n%O\n", file, err || "未返回对象"));
        } else loaded++;
    }
    foreach (file in entries) {
        if (file_size(dir + file) == -2) {
            if (excluded_dir(dir + file + "/")) skipped++;
            else call_out("loadall", 1, dir + file + "/", me);
        } else if (member_array(dir + file, sources) == -1) skipped++;
    }
    report = sprintf("目录 %s：加载成功 %d，失败 %d，跳过 %d。\n", dir, loaded, failed, skipped);
    log_file("loadall", report);
    if (objectp(me)) tell_object(me, report);
    return 1;
}

int help(object me) {
    write(@HELP
指令格式：loadall [目录]
示例：    loadall /d/city/
          loadall /d/items/

加载目录及子目录中的 .lpc、.c 源文件；同名对象只加载一次，优先 .lpc。
省略目录时从 / 开始。子目录分批加载，每个目录分别报告成功、失败、
跳过数量，详细错误记录在 /log/loadall。已加载对象不会重新编译。

跳过隐藏目录、tests、simul_efun、event，以及 /u/、/data/、/fluffos/、
/tools/、/ai/ 等非扫描目录；直接指定这些目录的子目录也不加载。
本指令不枚举虚拟品种。更新现有对象请使用 update 或 updateall。
HELP);
    return 1;
}
